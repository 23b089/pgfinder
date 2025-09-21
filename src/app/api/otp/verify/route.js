import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { createHmac } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { otpId, code } = body;
    if (!otpId || !code) return NextResponse.json({ error: 'missing' }, { status: 400 });

  const ref = adminDb.collection('otps').doc(otpId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ valid: false, message: 'OTP not found' }, { status: 400 });
  const data = snap.data();
  if (data.used) return NextResponse.json({ valid: false, message: 'OTP already used' }, { status: 400 });
  const now = new Date();
  const exp = data.expiresAt?.toDate?.() || (data.expiresAt instanceof Date ? data.expiresAt : null);
  if (exp && exp < now) return NextResponse.json({ valid: false, message: 'OTP expired' }, { status: 400 });

  const secret = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_OTP_SECRET || 'dev-secret-change-me';
  const hash = createHmac('sha256', secret).update(code).digest('hex');
  if (hash !== data.otpHash) return NextResponse.json({ valid: false, message: 'Invalid OTP' }, { status: 400 });

  await ref.update({ used: true, usedAt: Timestamp.now() });
  return NextResponse.json({ valid: true });
  } catch (err) {
    console.error('API verify OTP error', err);
    return NextResponse.json({ error: err.message || 'server error' }, { status: 500 });
  }
}
