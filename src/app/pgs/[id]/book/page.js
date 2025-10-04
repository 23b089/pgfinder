"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DeprecatedOTPBookingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    // This OTP page has been deprecated. Redirect users to the PG detail page.
    if (id) router.replace(`/pgs/${id}`);
    else router.replace('/pgs');
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Redirecting…</p>
    </div>
  );
}
