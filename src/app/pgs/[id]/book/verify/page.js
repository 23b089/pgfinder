"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { PhoneAuthProvider, linkWithCredential, reauthenticateWithCredential } from 'firebase/auth';
import { getProperty } from '@/lib/properties';
import { createBooking } from '@/lib/bookings';
import Link from 'next/link';

export default function VerifyBookingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getProperty(id);
      if (res.success) setProperty(res.property);
    })();
    if (typeof window !== 'undefined') {
      setPhone(sessionStorage.getItem('bookingPhone') || '');
    }
  }, [id]);

  const confirmCode = async () => {
    try {
      setLoading(true);
      setError('');
      if (!property) return;
      if (typeof window === 'undefined') return;
      const verificationId = sessionStorage.getItem('phoneVerificationId');
      const user = auth.currentUser;
      const alreadyLinked = (user?.providerData || []).some(p => p.providerId === 'phone');
      if (!verificationId) { setError('Verification session expired. Please restart.'); return; }
      const credential = PhoneAuthProvider.credential(verificationId, code);
      if (alreadyLinked) {
        // Reauthenticate when provider is already linked
        await reauthenticateWithCredential(user, credential);
      } else {
        await linkWithCredential(user, credential);
      }

      const currentUser = auth.currentUser;
      if (!currentUser) { setError('Please login to continue'); return; }

  const bookingData = {
        userId: currentUser.uid || currentUser.id,
        userName: currentUser.displayName || currentUser.email,
        propertyId: property.id,
        propertyName: property.pgName || property.name,
        ownerId: property.ownerId,
        location: property.location,
        roomType: property.roomType || property.sharingType,
        occupants: 1,
  rentAmount: property.price,
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
      };

      const result = await createBooking(bookingData);
      if (result.success) {
        // Clear session storage
        sessionStorage.removeItem('phoneVerificationId');
        sessionStorage.removeItem('bookingPhone');
        router.push('/dashboard/user');
      } else {
        setError(result.error || 'Booking failed');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="p-8 max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Verify your phone</h2>
          <p className="text-sm text-gray-600 mb-4">We sent a 6-digit code to {phone || 'your phone'}.</p>

          <label className="block text-sm font-medium text-gray-800 mb-2">Enter 6-digit OTP</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 123456"
            maxLength={6}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-black"
          />

          <button
            onClick={confirmCode}
            disabled={loading || code.length !== 6}
            className="mt-4 w-full bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & Book'}
          </button>

          {error && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Didn’t get the code? <Link href={`/pgs/${id}/book`} className="text-indigo-700 font-semibold underline">Go back to resend</Link>
          </div>
        </div>
      </div>
      {/* The reCAPTCHA container still exists on the previous page */}
    </div>
  );
}
