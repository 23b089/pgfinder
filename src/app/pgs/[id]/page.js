// src/app/pgs/[id]/page.js
 'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getProperty } from '@/lib/properties';

export default function PGDetail() {
  const params = useParams();
  const id = params?.id;
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getProperty(id);
        if (res.success) setPg(res.property);
        else setError(res.error || 'Property not found');
      } catch (e) {
        console.error('Failed to load property', e);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading property...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!pg) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{pg.pgName || pg.name}</h1>
            <p className="text-gray-700">{pg.location}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">₹{pg.price?.toLocaleString?.() || pg.price}</div>
            <div className="text-xs text-gray-500">per month per head</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-sm text-gray-800">
            <p><span className="font-medium">Sharing:</span> {pg.roomType || pg.sharingType}</p>
            <p><span className="font-medium">Gender:</span> {pg.gender || 'Unisex'}</p>
            <p><span className="font-medium">Available slots:</span> {pg.availableSlots || 0}</p>
          </div>
          {Array.isArray(pg.amenities) && pg.amenities.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {pg.amenities.map((a, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {pg.availableSlots > 0 ? (
          <Link href={`/pgs/${pg.id}/book`} className="w-full inline-flex justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
            Book Now
          </Link>
        ) : (
          <button disabled className="w-full bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold cursor-not-allowed">Full</button>
        )}
        </div>
      </div>
    </div>
  );
}