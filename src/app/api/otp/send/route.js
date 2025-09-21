import { NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/otp';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, email, propertyId } = body;
    if (!userId || !email || !propertyId) return NextResponse.json({ error: 'missing' }, { status: 400 });

    // Enforce cooldown on server using Admin SDK
    const q = await adminDb.collection('otps')
      .where('userId', '==', userId)
      .where('propertyId', '==', propertyId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (!q.empty) {
      const latest = q.docs[0].data();
      const lastMs = latest.createdAt?.toMillis?.() || (latest.createdAt instanceof Date ? latest.createdAt.getTime() : 0);
      const ageSec = (Date.now() - lastMs) / 1000;
      const RESEND_COOLDOWN_SEC = 60;
      if (ageSec < RESEND_COOLDOWN_SEC) {
        return NextResponse.json({ error: 'cooldown', retryAfter: Math.ceil(RESEND_COOLDOWN_SEC - ageSec) }, { status: 429 });
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const docRef = await adminDb.collection('otps').add({
      userId,
      email,
      propertyId,
      // We'll still hash via lib/otp when verifying; here we store plain only if email relies on it.
      // For strictness, do not store plain OTP; send separately and store only hash.
      // Keep compatibility: compute hash via a local helper in route or reuse lib/otp save if needed.
      // For now, store no plain OTP.
      otpHash: null,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      used: false,
    });

    // Send email with the OTP
    await sendOTPEmail(email, otp);

    // After emailing, update the doc with the HMAC hash (avoid keeping plain anywhere)
    const { createHmac } = await import('node:crypto');
    const secret = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_OTP_SECRET || 'dev-secret-change-me';
    const otpHash = createHmac('sha256', secret).update(otp).digest('hex');
    await docRef.update({ otpHash });

    return NextResponse.json({ otpId: docRef.id });
  } catch (err) {
    console.error('API send OTP error', err);
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}
