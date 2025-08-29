'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  UtensilsCrossed, 
  Heart, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Home,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { getProperty } from '@/lib/properties';
import { createBooking } from '@/lib/bookings';

export default function PGDetails() {
  const params = useParams();
  const router = useRouter();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadPGDetails = async () => {
      try {
        // Get current user
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
        }

        // Load PG details
        const result = await getProperty(params.id);
        if (result.success) {
          setPg(result.property);
        } else {
          alert('PG not found');
          router.push('/pgs');
        }
      } catch (error) {
        console.error('Error loading PG details:', error);
        alert('Error loading PG details');
        router.push('/pgs');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadPGDetails();
    }
  }, [params.id, router]);

  const bookPG = async () => {
    if (!currentUser) {
      alert('Please login to book a PG');
      return;
    }

    if (currentUser.role !== 'user') {
      alert('Only users can book PGs');
      return;
    }

    if (!pg.availableSlots || pg.availableSlots <= 0) {
      alert('No spaces available for booking');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        userId: currentUser.id,
        userName: currentUser.fullName,
        propertyId: pg.id,
        propertyName: pg.pgName || pg.name,
        ownerId: pg.ownerId,
        location: pg.location,
        roomType: pg.roomType || pg.sharingType,
        occupants: 1,
        rentAmount: pg.price,
        securityDeposit: Math.round(pg.price * 0.1), // 10% security deposit
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const result = await createBooking(bookingData);
      if (result.success) {
        alert('PG booked successfully! Please complete the payment to confirm your booking.');
        router.push('/dashboard/user');
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error booking PG:', error);
      alert('Error booking PG. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PG details...</p>
        </div>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">PG Not Found</h2>
          <Link href="/pgs" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300">
            Back to PGs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/pgs" className="hover:text-indigo-200 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PG Details</h1>
                <p className="text-sm text-indigo-100">{pg.pgName || pg.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* PG Information Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{pg.pgName || pg.name}</h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{pg.location}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium">{pg.rating || 4.5}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pg.status)}`}>
                    {pg.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">₹{pg.price?.toLocaleString() || pg.price}</div>
                <div className="text-sm text-gray-600">per month per head</div>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Room Type</div>
                <div className="font-semibold text-gray-800">{pg.roomType || pg.sharingType}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Home className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Available Spaces</div>
                <div className="font-semibold text-gray-800">{pg.availableSlots || 0}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Gender</div>
                <div className="font-semibold text-gray-800">{pg.gender}</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <DollarSign className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Security Deposit (approx)</div>
                <div className="font-semibold text-gray-800">₹{Math.round((pg.price || 0) * 0.1).toLocaleString()} per head</div>
              </div>
            </div>

            {/* Description */}
            {pg.description && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{pg.description}</p>
              </div>
            )}

            {/* Amenities */}
            {pg.amenities && pg.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pg.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to Book?</h3>
                  <p className="text-gray-600">
                    {pg.availableSlots > 0 
                      ? `${pg.availableSlots} space(s) available for immediate booking`
                      : 'No spaces currently available'
                    }
                  </p>
                </div>
                <div className="flex space-x-4">
                      {currentUser?.role === 'user' ? (
                    <button
                      onClick={bookPG}
                      disabled={!pg.availableSlots || pg.availableSlots <= 0 || bookingLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Booking...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5 mr-2" />
                          {pg.availableSlots > 0 ? 'Book Now' : 'Full'}
                        </>
                      )}
                    </button>
                  ) : currentUser?.role === 'owner' ? (
                    <Link
                      href="/dashboard/owner"
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300"
                    >
                      Manage PGs
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300"
                    >
                      Login to Book
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium text-gray-800">Contact owner for details</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-800">Contact owner for details</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
