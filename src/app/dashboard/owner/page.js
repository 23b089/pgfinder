'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, MapPin, Calendar, Phone, Mail, Settings, LogOut, Home, BarChart3, UserCheck, CheckCircle, XCircle, Clock } from "lucide-react";
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
  const [bookingBadgeCount, setBookingBadgeCount] = useState(0);

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
              const list = bookingsResult.bookings || [];
              setBookings(list);
              const pending = list.filter(b => ((b.status || '') + '').toLowerCase() === 'pending').length;
              setBookingBadgeCount(pending);
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
    
    return {
      totalRooms,
      occupiedRooms,
      availableRooms
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
        if (bookingsResult.success) {
          const list = bookingsResult.bookings || [];
          setBookings(list);
          const pending = list.filter(b => ((b.status || '') + '').toLowerCase() === 'pending').length;
          setBookingBadgeCount(pending);
        }
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
        if (bookingsResult.success) {
          const list = bookingsResult.bookings || [];
          setBookings(list);
          const pending = list.filter(b => ((b.status || '') + '').toLowerCase() === 'pending').length;
          setBookingBadgeCount(pending);
        }
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">PG Finder</h1>
                <p className="text-xs sm:text-sm text-green-100 hidden sm:block">Owner Dashboard</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link href="#" className="hover:text-green-200 transition-colors flex items-center text-sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Link>
              <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white px-2 lg:px-3 py-2 rounded-lg transition-all duration-300 text-sm">
                Delete Account
              </button>
              <Link href="/" className="bg-white/20 hover:bg-white/30 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 flex items-center text-sm">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Link>
            </nav>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              <Link href="#" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all" title="Settings">
                <Settings className="w-4 h-4" />
              </Link>
              <button onClick={handleDeleteAccount} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all" title="Delete Account">
                <Trash2 className="w-4 h-4" />
              </button>
              <Link href="/" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all" title="Logout">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 px-6 hidden md:block">
        <div className="container mx-auto">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'bookings', label: 'Bookings', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'bookings') {
                    setBookingBadgeCount(0);
                  }
                }}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.id === 'bookings' && activeTab !== 'bookings' && bookingBadgeCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{bookingBadgeCount}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Section Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          {(() => {
            const currentTabData = [
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'properties', label: 'Properties', icon: Home },
              { id: 'bookings', label: 'Bookings', icon: Calendar }
            ].find(tab => tab.id === activeTab);
            const Icon = currentTabData?.icon;
            return (
              <>
                {Icon && <Icon className="w-5 h-5 mr-2 text-green-600" />}
                <span className="text-lg font-semibold text-gray-800">{currentTabData?.label}</span>
                {activeTab === 'bookings' && bookingBadgeCount > 0 && (
                  <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">{bookingBadgeCount}</span>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-20 md:pb-8">
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
                  {Array.isArray(pg.images) && pg.images.length > 0 && (
                    <div className="mb-4 -mt-2 -mx-2">
                      <div className="relative w-full h-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pg.images[0]} alt={`${pg.pgName || pg.name} cover`} className="w-full h-40 object-cover rounded-xl" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        <Link href={`/dashboard/owner/pg/${pg.id}/guests`} className="hover:underline hover:text-blue-700">
                          {pg.pgName || pg.name}
                        </Link>
                      </h3>
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
            {/* Header and Filters - Mobile Responsive */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
              
              {/* Filters Container */}
              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                <select className="w-full md:w-auto px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base">
                  <option>All Properties</option>
                  {myPGs.map(pg => (
                    <option key={pg.id} value={pg.id}>{pg.pgName || pg.name}</option>
                  ))}
                </select>
                <select className="w-full md:w-auto px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base">
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
              <div className="space-y-4">
                {/* Desktop Table View - Hidden on Mobile */}
                <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
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

                {/* Mobile Card View - Shown on Mobile */}
                <div className="md:hidden space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                      {/* Guest Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{booking.userName}</h3>
                          <p className="text-gray-600 text-sm">{booking.userPhone || 'N/A'}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                      </div>

                      {/* Property Details */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Property</p>
                          <p className="text-sm font-medium text-gray-900">{booking.propertyName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Room Type</p>
                          <p className="text-sm font-medium text-gray-900">{booking.roomType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                          <p className="text-sm font-medium text-gray-900">₹{booking.rentAmount?.toLocaleString?.() || booking.rentAmount} <span className="text-xs text-gray-500">/head</span></p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        {booking.status === 'pending' ? (
                          <div className="flex space-x-2 flex-1">
                            <button 
                              onClick={() => handleAccept(booking.id)} 
                              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-center min-h-[48px] flex items-center justify-center"
                            >
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Accept
                            </button>
                            <button 
                              onClick={() => handleReject(booking.id)} 
                              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors text-center min-h-[48px] flex items-center justify-center"
                            >
                              <XCircle className="w-5 h-5 mr-2" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex justify-center">
                            <p className="text-sm text-gray-500">
                              {booking.status === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled'}
                            </p>
                          </div>
                        )}
                        
                        <button className="ml-3 p-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab removed */}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <nav className="flex justify-around items-center py-3 px-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'properties', label: 'Properties', icon: Home },
            { id: 'bookings', label: 'Bookings', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'bookings') {
                    setBookingBadgeCount(0);
                  }
                }}
                className={`flex items-center justify-center p-3 min-w-0 flex-1 relative transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={tab.label}
              >
                <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-green-600' : ''}`} />
                {tab.id === 'bookings' && activeTab !== 'bookings' && bookingBadgeCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {bookingBadgeCount > 9 ? '9+' : bookingBadgeCount}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
     </div>
   );
 }

