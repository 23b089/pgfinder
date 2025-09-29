"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DeprecatedOTPVerifyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('phoneVerificationId');
      sessionStorage.removeItem('bookingPhone');
    }
    if (id) router.replace(`/pgs/${id}`);
    else router.replace('/pgs');
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700">Redirecting…</p>
    </div>
  );
}
