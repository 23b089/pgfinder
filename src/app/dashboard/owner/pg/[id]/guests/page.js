'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, ArrowLeft, Users } from 'lucide-react';

export default function PGGuestsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pg, setPg] = useState(null);
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        if (!userResult.success || !userResult.user || userResult.user.role !== 'owner') {
          alert('Please login as an owner to view this page');
          router.push('/login');
          return;
        }
        setCurrentUser(userResult.user);

        // Load property details
        const { getProperty } = await import('@/lib/properties');
        const propRes = await getProperty(propertyId);
        if (!propRes.success) {
          setError(propRes.error || 'Property not found');
          setLoading(false);
          return;
        }
        if (propRes.property.ownerId !== userResult.user.id) {
          setError('Unauthorized: This property does not belong to you.');
          setLoading(false);
          return;
        }
        setPg(propRes.property);

        // Load bookings for this property and filter to active/confirmed
        const { getUserBookings } = await import('@/lib/bookings');
        // Fallback: get all owner bookings and filter locally to avoid adding a new API
        const ownerBookingsRes = await (await import('@/lib/bookings')).getOwnerBookings(userResult.user.id);
        if (ownerBookingsRes.success) {
          const subset = ownerBookingsRes.bookings
            .filter(b => b.propertyId === propertyId)
            .filter(b => ['confirmed', 'active', 'paid'].includes(((b.status || '') + '').toLowerCase()));
          // Sort by check-in ascending
          subset.sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
          setGuests(subset);
        } else {
          setError(ownerBookingsRes.error || 'Failed to load guests');
        }
      } catch (err) {
        console.error('Load PG guests error:', err);
        setError('Failed to load guests');
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) load();
  }, [propertyId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/owner" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-green-600 mr-2" />
              <h1 className="text-lg font-semibold text-gray-800">Guests</h1>
            </div>
          </div>
          {pg && (
            <div className="text-sm text-gray-600">
              for <span className="font-semibold text-gray-800">{pg.pgName || pg.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading guests...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
        ) : guests.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No active guests found for this PG.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guests.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.userPhone || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        {new Date(g.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
