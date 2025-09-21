'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, MapPin, Star, DollarSign, Calendar, Phone, Mail, Settings, LogOut, Home, BarChart3, UserCheck, MessageSquare, Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { getPropertiesByOwner, deleteProperty, updateProperty } from '@/lib/properties';
import { getOwnerBookings, acceptBooking, rejectBooking } from '@/lib/bookings';

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [myPGs, setMyPGs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pgToDelete, setPgToDelete] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load owner's PGs on component mount and when component updates
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user from Firebase auth
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        
        if (userResult.success && userResult.user && userResult.user.role === 'owner') {
          setCurrentUser(userResult.user);
          setLoading(true);
          try {
            // Load PGs
            const pgsResult = await getPropertiesByOwner(userResult.user.id);
            if (pgsResult.success) {
              setMyPGs(pgsResult.properties);
            }

            // Load bookings
            const bookingsResult = await getOwnerBookings(userResult.user.id);
            if (bookingsResult.success) {
              setBookings(bookingsResult.bookings);
            }
          } catch (error) {
            console.error('Error loading data:', error);
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    loadData();
    
    // Listen for storage changes to refresh data
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also refresh when window gains focus (in case of redirects)
    window.addEventListener('focus', loadData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const handleDeleteAccount = async () => {
    if (!currentUser) return alert('Not authenticated');
    if (!confirm('Are you sure you want to delete your owner account? This will remove your properties and data.')) return;
    try {
      const { deleteAccount } = await import('@/lib/auth');
      const res = await deleteAccount(currentUser.id);
      if (res.success) {
        alert('Account deleted. Redirecting to home.');
        localStorage.removeItem('pgfinder_current_user');
        window.location.href = '/';
      } else {
        alert('Failed to delete account: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Error deleting account');
    }
  };

  // Calculate stats from actual data
  const calculateStats = () => {
    const ownerPGs = myPGs;
    
    // Calculate stats from actual data
    const totalRooms = ownerPGs.reduce((sum, pg) => sum + (pg.totalRooms || 0), 0);
    const occupiedRooms = ownerPGs.reduce((sum, pg) => sum + (pg.occupiedRooms || 0), 0);
    const availableRooms = ownerPGs.reduce((sum, pg) => sum + (pg.availableSlots || 0), 0);
    // Payment tracking removed. Keep placeholders for UI compatibility.
    const totalRevenueNum = 0;
    const monthlyBreakdown = [];
    
    return {
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalRevenueNum,
      monthlyBreakdown
    };
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (pg) => {
    setPgToDelete(pg);
    setShowDeleteModal(true);
  };

  // Delete PG function
  const handleDeletePG = async () => {
    if (!pgToDelete) return;
    
    try {
      // Get current user from Firebase auth
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      
      if (!userResult.success || !userResult.user || userResult.user.role !== 'owner') {
        alert('Access denied! Only PG owners can delete properties.');
        return;
      }
      // Call backend delete to remove from Firestore and owner's properties
      const result = await deleteProperty(pgToDelete.id, userResult.user.id);
      if (result.success) {
        // Refresh owner's PG list from backend
        const pgsResult = await getPropertiesByOwner(userResult.user.id);
        if (pgsResult.success) setMyPGs(pgsResult.properties);

        // Close modal and reset
        setShowDeleteModal(false);
        setPgToDelete(null);
      } else {
        console.error('Failed to delete property:', result.error);
        alert('Failed to delete property: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting PG:', error);
      alert('Error deleting PG. Please try again.');
    }
  };

  // Cancel delete
  // Owner accepts a booking request
  const handleAccept = async (bookingId) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');
      const res = await acceptBooking(bookingId, userResult.user.id);
      if (res.success) {
        alert('Booking accepted');
        const bookingsResult = await getOwnerBookings(userResult.user.id);
        if (bookingsResult.success) setBookings(bookingsResult.bookings);
      } else {
        alert('Failed to accept booking: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Accept handler error:', error);
      alert('Error accepting booking');
    }
  };

  // Owner rejects a booking request
  const handleReject = async (bookingId) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');
      const res = await rejectBooking(bookingId, userResult.user.id);
      if (res.success) {
        alert('Booking rejected');
        const bookingsResult = await getOwnerBookings(userResult.user.id);
        if (bookingsResult.success) setBookings(bookingsResult.bookings);
      } else {
        alert('Failed to reject booking: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Reject handler error:', error);
      alert('Error rejecting booking');
    }
  };

  // Payment tracking removed

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPgToDelete(null);
  };

  // Function to toggle PG visibility
  const togglePGVisibility = async (pgId, newVisibility) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');

      const result = await updateProperty(pgId, { visibility: newVisibility });
      if (result.success) {
        setMyPGs(prev => prev.map(pg => pg.id === pgId ? { ...pg, visibility: newVisibility } : pg));
        alert(`PG visibility changed to ${newVisibility === 'public' ? 'Public' : 'Feed Only'}.`);
      } else {
        alert('Failed to update visibility: ' + (result.error || 'Unknown'));
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      alert('Error updating visibility');
    }
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PG Finder</h1>
                <p className="text-sm text-green-100">Owner Dashboard</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#" className="hover:text-green-200 transition-colors flex items-center">
                <Bell className="w-4 h-4 mr-1" />
                Notifications
                <span className="ml-1 bg-red-500 text-xs px-2 py-1 rounded-full">3</span>
              </Link>
              <Link href="#" className="hover:text-green-200 transition-colors flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Link>
              <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-300">
                Delete Account
              </button>
              <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="container mx-auto">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
                         {/* Welcome Section */}
             <div className="bg-white rounded-2xl shadow-lg p-6">
               <h2 className="text-3xl font-bold text-gray-800 mb-2">
                 Welcome back, {currentUser?.fullName || 'Owner'}! 👋
               </h2>
               <p className="text-gray-600">
                 {myPGs.length === 0 
                   ? "You haven't added any PGs yet. Click 'Add New PG' to get started!" 
                   : "Here's what's happening with your properties today."}
               </p>
             </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{myPGs.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue (Current Month)</p>
                    <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRevenueNum || 0).toLocaleString()}</p>
                    <div className="mt-2 text-sm text-gray-600">
                      {stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 ? (
                        <div className="space-y-1">
                          {stats.monthlyBreakdown.map(m => (
                            <div key={m.month} className="flex justify-between">
                              <span>{m.month}</span>
                              <span>₹{m.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No paid months recorded yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">My Properties</h2>
              <Link href="/dashboard/owner/add-pg" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New PG
              </Link>
            </div>

                         {myPGs.length === 0 ? (
               <div className="col-span-full">
                 <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Home className="w-10 h-10 text-gray-400" />
                   </div>
                   <h3 className="text-xl font-semibold text-gray-800 mb-2">No PGs Added Yet</h3>
                   <p className="text-gray-600 mb-6">Start by adding your first PG property to begin managing your listings.</p>
                   <Link href="/dashboard/owner/add-pg" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 inline-flex items-center">
                     <Plus className="w-5 h-5 mr-2" />
                     Add Your First PG
                   </Link>
                 </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {myPGs.map((pg) => (
                <div key={pg.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{pg.pgName || pg.name}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{pg.location}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {pg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Total Rooms</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.totalRooms}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Available Slots</p>
                      <p className="text-lg font-semibold text-gray-900">{(pg.availableSlots != null ? pg.availableSlots : Math.floor((pg.availableRooms || pg.totalRooms || 0) * (pg.roomCapacity || 1)))} / {pg.totalSlots || ((pg.totalRooms || 0) * (pg.roomCapacity || 1))}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Monthly Rent per Head</p>
                      <p className="text-lg font-semibold text-gray-900">₹{pg.price} <span className="text-xs text-gray-500">/head</span></p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Room Type</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.roomType}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {pg.amenities?.length || 0} amenities
                    </span>
                    <div className="flex items-center space-x-2">
                      {/* Visibility Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pg.visibility === 'public' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {pg.visibility === 'public' ? 'Public' : 'Feed Only'}
                      </span>
                      <button
                        onClick={() => togglePGVisibility(pg.id, pg.visibility === 'public' ? 'feed_only' : 'public')}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={`Make ${pg.visibility === 'public' ? 'Feed Only' : 'Public'}`}
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <Link href={`/dashboard/owner/view-pg/${pg.id}`} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={`/dashboard/owner/edit-pg/${pg.id}`} className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => showDeleteConfirmation(pg)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete PG"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                 </div>
               ))}
               </div>
             )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
              <div className="flex space-x-4">
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>All Properties</option>
                  {myPGs.map(pg => (
                    <option key={pg.id} value={pg.id}>{pg.pgName || pg.name}</option>
                  ))}
                </select>
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option>All Status</option>
                  <option>Confirmed</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bookings found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.userName}</div>
                              <div className="text-sm text-gray-500">{booking.userPhone || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.propertyName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.roomType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{booking.rentAmount?.toLocaleString?.() || booking.rentAmount} <span className="text-xs text-gray-500">/head</span></td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {booking.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {booking.status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {booking.status === 'pending' && (
                                <>
                                  <button onClick={() => handleAccept(booking.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Accept</button>
                                  <button onClick={() => handleReject(booking.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">Reject</button>
                                </>
                              )}
                              {/* Payment features removed */}
                              <button className="text-indigo-600 hover:text-indigo-700">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    <div className="ml-3">
                      <p className="text-2xl font-bold text-gray-900">4.5</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {[
                  {
                    guest: 'Rahul Sharma',
                    pg: 'Green Valley PG',
                    rating: 5,
                    review: 'Excellent facilities and very well maintained. The staff is very cooperative and the food is amazing.',
                    date: '2 days ago'
                  },
                  {
                    guest: 'Priya Singh',
                    pg: 'Green Valley PG',
                    rating: 4,
                    review: 'Good location and clean rooms. WiFi speed could be better but overall satisfied.',
                    date: '1 week ago'
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900">{review.guest}</h4>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{review.pg}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.review}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
                 )}
       </div>

       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
             <div className="text-center">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Trash2 className="w-8 h-8 text-red-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2">Delete PG</h3>
               <p className="text-gray-600 mb-6">
                 Are you sure you want to delete <span className="font-semibold">{pgToDelete?.name}</span>? 
                 This action cannot be undone.
               </p>
               <div className="flex space-x-4">
                 <button
                   onClick={cancelDelete}
                   className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleDeletePG}
                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300"
                 >
                   Delete
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }

