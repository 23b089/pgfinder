"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getProperty } from '@/lib/properties';
import { createBooking } from '@/lib/bookings';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, linkWithPhoneNumber, reauthenticateWithPhoneNumber } from 'firebase/auth';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || null;
  const { currentUser, loading: authLoading } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [confirmation, setConfirmation] = useState(null); // kept for backward compat but navigation is used
  const [otp, setOtp] = useState(''); // not used on this page after redirect
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getProperty(id);
      if (res.success) setProperty(res.property);
    })();
    return () => {
      if (typeof window !== 'undefined' && window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear && window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = undefined;
      }
    };
  }, [id]);

  // Initialize reCAPTCHA verifier robustly (clear stale instances/hot reload)
  const ensureRecaptcha = () => {
    if (typeof window === 'undefined') return null;
    const containerId = 'recaptcha-container';
    const container = document.getElementById(containerId);
    if (!container) return null;
    // Always clear any previous instance to avoid "client element removed" in dev/HMR
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear && window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = undefined;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
    return window.recaptchaVerifier;
  };

  const sendOTP = async () => {
    try {
      setLoading(true);
      setError('');
      setInfo('');
  // Require a signed-in Firebase Auth user for phone linking
  if (!auth.currentUser) { setError('Please login to continue'); return; }
      if (!phone || !/^\+\d{10,15}$/.test(phone)) { setError('Enter phone in E.164 format, e.g. +919876543210'); return; }

      const user = auth.currentUser;
      const hasPhoneProvider = (user?.providerData || []).some(p => p.providerId === 'phone');
      const existingPhone = user?.phoneNumber || '';

      // If phone already linked, reauthenticate with OTP (do not re-link)
      if (hasPhoneProvider) {
        if (existingPhone && existingPhone !== phone) {
          setError(`Your account is already linked to ${existingPhone}. Use that number or update your profile.`);
          return;
        }
        // Send OTP for reauthentication
        const appVerifier = ensureRecaptcha();
        const result = await reauthenticateWithPhoneNumber(user, phone, appVerifier);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('phoneVerificationId', result.verificationId);
          sessionStorage.setItem('bookingPhone', phone);
        }
        router.push(`/pgs/${id}/book/verify`);
        return;
      }

      // Otherwise, send OTP for linking
      const appVerifier = ensureRecaptcha();
      const result = await linkWithPhoneNumber(auth.currentUser, phone, appVerifier);
      // Store verificationId and phone for the verify page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('phoneVerificationId', result.verificationId);
        sessionStorage.setItem('bookingPhone', phone);
      }
      // Navigate to verify page
      router.push(`/pgs/${id}/book/verify`);
      return;
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Failed to send OTP';
      setError(msg.includes('reCAPTCHA') ? 'reCAPTCHA validation failed. Refresh and try again.' : msg);
    } finally { setLoading(false); }
  };

  if (!property) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-8 max-w-2xl mx-auto text-gray-800">Loading booking page...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Book {property.pgName || property.name}</h2>
          <p className="mb-1 text-gray-700">Price: <span className="font-semibold text-indigo-700">₹{property.price}</span> per month per head</p>
          <p className="mb-5 text-gray-700">Available slots: <span className="font-semibold">{property.availableSlots || 0}</span></p>

          {/* Auth state notice */}
          {!authLoading && !currentUser && (
            <div className="mb-4 border border-yellow-200 bg-yellow-50 text-yellow-800 rounded-xl px-4 py-3 text-sm">
              Please sign in to book this PG.
              <Link href="/login" className="ml-2 font-semibold underline text-yellow-900">Sign in</Link>
            </div>
          )}

          {currentUser && currentUser.role && currentUser.role !== 'user' && (
            <div className="mb-4 border border-blue-200 bg-blue-50 text-blue-800 rounded-xl px-4 py-3 text-sm">
              Only users can book PGs. Switch to a user account to continue.
            </div>
          )}

          {
            <div>
              <p className="text-sm text-gray-600 mb-3">We will send a 6-digit code to your phone for verification.</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="tel"
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-black"
                />
              </div>
              <button
                onClick={sendOTP}
                disabled={loading || authLoading || !auth.currentUser || (currentUser?.role !== 'user') || (property.availableSlots || 0) <= 0}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending…' : (!currentUser ? 'Sign in to send OTP' : 'Send OTP to confirm booking')}
              </button>
            </div>
          }

          {info && (
            <div className="mt-4 border border-blue-200 bg-blue-50 text-blue-800 rounded-xl px-4 py-3 text-sm">
              {info}
            </div>
          )}
          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {/* Invisible Recaptcha container required by Firebase Phone Auth */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
}
