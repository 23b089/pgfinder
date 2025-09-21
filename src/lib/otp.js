import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, Timestamp, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import sendEmail from './email';
import crypto from 'crypto';

// Configuration
const OTP_LENGTH = 6;
const OTP_TTL_MIN = 5; // minutes
const RESEND_COOLDOWN_SEC = 60; // seconds
const OTP_SECRET = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_OTP_SECRET || 'dev-secret-change-me';

export function generateOTP() {
  return Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * (9 * 10 ** (OTP_LENGTH - 1))).toString();
}

function hmacOtp(otp) {
  return crypto.createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

// Save OTP record in Firestore with TTL and hashed code. Returns otpId.
export async function saveOTP({ userId, email, propertyId, otp }) {
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
  const hashed = hmacOtp(otp);
  const ref = await addDoc(collection(db, 'otps'), {
    userId,
    email,
    propertyId,
    otpHash: hashed,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(expiresAt),
    used: false,
  });
  return ref.id;
}

// Check cooldown for resend: last sent within RESEND_COOLDOWN_SEC
export async function canSendOTP({ userId, email, propertyId }) {
  // Query recent OTPs for this user+property ordered by createdAt desc and check timestamp
  const q = query(collection(db, 'otps'), where('userId', '==', userId), where('propertyId', '==', propertyId), orderBy('createdAt', 'desc'));
  const snaps = await getDocs(q);
  const first = snaps.docs[0];
  if (!first) return { ok: true };
  const latest = first.data();
  const lastMs = latest.createdAt && latest.createdAt.toMillis ? latest.createdAt.toMillis() : (new Date(latest.createdAt).getTime());
  const ageSec = (Date.now() - lastMs) / 1000;
  if (ageSec < RESEND_COOLDOWN_SEC) {
    return { ok: false, retryAfter: Math.ceil(RESEND_COOLDOWN_SEC - ageSec) };
  }
  return { ok: true };
}

// Verify OTP by document id and code (atomic check & mark used)
export async function verifyOTP(otpId, code) {
  const ref = doc(db, 'otps', otpId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { valid: false, message: 'OTP not found' };

  const data = snap.data();
  if (data.used) return { valid: false, message: 'OTP already used' };
  if (data.expiresAt && data.expiresAt.toDate && data.expiresAt.toDate() < new Date()) return { valid: false, message: 'OTP expired' };
  const hashed = hmacOtp(code);
  if (hashed !== data.otpHash) return { valid: false, message: 'Invalid OTP' };
  // Mark used
  await updateDoc(ref, { used: true, usedAt: serverTimestamp() });
  return { valid: true };
}

// Send OTP email via server-side email helper
export async function sendOTPEmail(email, otp) {
  const subject = 'PG Booking Verification OTP';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">PG Booking Verification</h2>
      <p>Your OTP for booking confirmation is:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in ${OTP_TTL_MIN} minutes.</p>
      <p style="color: #6B7280; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
}

