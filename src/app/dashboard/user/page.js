'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  UtensilsCrossed, 
  Filter, 
  Heart, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  LogOut, 
  User, 
  Settings, 
  BookmarkPlus,
  Home,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  Edit,
  Trash2,
  Bell
} from "lucide-react";
import Link from "next/link";
import { getPropertiesForFeed, getAllPropertiesDebug } from '@/lib/properties';
import { getUserBookings, getUserNotifications, markNotificationAsRead, createBooking, completeStay, deleteNotifications, deleteAllNotificationsForUser } from '@/lib/bookings';

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    gender: '',
    budget: '',
    roomType: '',
    foodIncluded: ''
  });

  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [selectAllNotifs, setSelectAllNotifs] = useState(false);
  // Rent due tracking removed
  // Bookings visible in the 'Bookings' tab (exclude cancelled)
  const visibleBookings = bookings.filter(b => ((b.status || '').toLowerCase() !== 'cancelled'));
  const [reviewInputs, setReviewInputs] = useState({});

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user from Firebase auth
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        
        if (!userResult.success || !userResult.user) {
          alert('Please login to access the dashboard');
          window.location.href = '/login';
          return;
        }
        
        if (userResult.user.role !== 'user') {
          alert('Access denied! This dashboard is for users only.');
          window.location.href = '/login';
          return;
        }
        
        setCurrentUser(userResult.user);
        loadUserData(userResult.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        alert('Please login to access the dashboard');
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, []);

  const handleDeleteAccount = async () => {
    if (!currentUser) return alert('Not authenticated');
    if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    try {
      const { deleteAccount } = await import('@/lib/auth');
      const res = await deleteAccount(currentUser.id);
      if (res.success) {
        alert('Account deleted. You will be redirected to home.');
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

  // Load properties when search tab is activated
  useEffect(() => {
    if (activeTab === 'search' && properties.length === 0) {
      loadPropertiesForFeed();
    }
  }, [activeTab, properties.length]);

  const loadUserData = async (user) => {
    try {
      // Load user's bookings
      const bookingsResult = await getUserBookings(user.id);
      if (bookingsResult.success) {
        setBookings(bookingsResult.bookings);
      }

      // Rent due feature removed

      // Load user notifications
      const notificationsResult = await getUserNotifications(user.id);
  if (notificationsResult.success) {
    setNotifications(notificationsResult.notifications);
  // compute unread count
  const unread = (notificationsResult.notifications || []).filter(n => !n.isRead).length;
  setUnreadCount(unread);
    setSelectedNotifIds([]);
    setSelectAllNotifs(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadPropertiesForFeed = async () => {
    try {
      setSearchLoading(true);
      
      // Debug: Get all properties first
      const debugResult = await getAllPropertiesDebug();
      console.log('Debug - All properties:', debugResult);
      
      const result = await getPropertiesForFeed();
      console.log('Feed result:', result);
      
      if (result.success) {
        setProperties(result.properties);
      } else {
        console.error('Failed to load properties for feed:', result.error);
        setProperties([]); // No fallback to mock data
      }
    } catch (error) {
      console.error('Error loading properties for feed:', error);
      setProperties([]); // No fallback to mock data
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleFavorite = (pgId) => {
    setFavorites(prev => 
      prev.includes(pgId) 
        ? prev.filter(id => id !== pgId)
        : [...prev, pgId]
    );
  };

  const bookPG = async (pg) => {
    if (!currentUser) {
      alert('Please login to book a PG');
      return;
    }

    try {
      // Basic UI-side availability check
      const available = pg.availableSlots != null ? parseInt(pg.availableSlots, 10) : 0;
      if (available <= 0) {
        alert('No slots available for this PG');
        return;
      }
      const bookingData = {
        userId: currentUser.id,
        userName: currentUser.fullName,
        propertyId: pg.id,
        propertyName: pg.pgName || pg.name,
        ownerId: pg.ownerId,
        location: pg.location,
        roomType: pg.roomType,
        occupants: 1,
        rentAmount: pg.price,
  // securityDeposit removed
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const result = await createBooking(bookingData);
      if (result.success) {
        alert('PG booked successfully! Please complete the payment to confirm your booking.');
        // Refresh user data
        loadUserData(currentUser);
        // Switch to bookings tab
        setActiveTab('bookings');
      } else {
        alert('Booking failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error booking PG:', error);
      alert('Error booking PG. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pgfinder_current_user');
    window.location.href = '/';
  };

  // Receipt download removed with payments

  // Notification selection and deletion helpers
  const toggleSelectNotif = (id) => {
    setSelectedNotifIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAllNotifs = () => {
    const next = !selectAllNotifs;
    setSelectAllNotifs(next);
    setSelectedNotifIds(next ? notifications.map(n => n.id) : []);
  };
  const handleDeleteSelected = async () => {
    if (!currentUser) return alert('Not authenticated');
    if (selectedNotifIds.length === 0) return;
    if (!confirm(`Delete ${selectedNotifIds.length} selected notification(s)?`)) return;
    const res = await deleteNotifications(selectedNotifIds, currentUser.id);
    if (res.success) {
      const remaining = notifications.filter(n => !selectedNotifIds.includes(n.id));
      setNotifications(remaining);
      const unread = remaining.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      setSelectedNotifIds([]);
      setSelectAllNotifs(false);
    } else {
      alert(res.error || 'Failed to delete selected notifications');
    }
  };
  const handleDeleteAll = async () => {
    if (!currentUser) return alert('Not authenticated');
    if (notifications.length === 0) return;
    if (!confirm('Delete ALL notifications? This cannot be undone.')) return;
    const res = await deleteAllNotificationsForUser(currentUser.id);
    if (res.success) {
      setNotifications([]);
      setUnreadCount(0);
      setSelectedNotifIds([]);
      setSelectAllNotifs(false);
    } else {
      alert(res.error || 'Failed to delete all notifications');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Active':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Active':
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleCheckout = async (bookingId) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');
      const res = await completeStay(bookingId, userResult.user.id);
      if (res.success) {
        alert('Checkout successful');
        // reload bookings
        const bookingsResult = await getUserBookings(userResult.user.id);
        if (bookingsResult.success) setBookings(bookingsResult.bookings);
      } else {
        alert('Failed to checkout: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Checkout handler error:', error);
      alert('Error during checkout');
    }
  };

  const handleSubmitReview = async (bookingId) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');

      const text = reviewInputs[bookingId]?.text || '';
      const rating = reviewInputs[bookingId]?.rating || 5;
      if (!text) return alert('Please write a review before submitting');

      const { submitReview } = await import('@/lib/bookings');
      const res = await submitReview(bookingId, userResult.user.id, text, rating);
      if (res.success) {
        alert('Review submitted. Thank you!');
        const bookingsResult = await getUserBookings(userResult.user.id);
        if (bookingsResult.success) setBookings(bookingsResult.bookings);
        // clear input
        setReviewInputs(prev => { const copy = { ...prev }; delete copy[bookingId]; return copy; });
      } else {
        alert('Failed to submit review: ' + (res.error || 'Unknown'));
      }
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Error submitting review');
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const { getCurrentUser } = await import('@/lib/auth');
      const userResult = await getCurrentUser();
      if (!userResult.success || !userResult.user) return alert('Not authenticated');

      const { cancelBooking } = await import('@/lib/bookings');
      const res = await cancelBooking(bookingId, userResult.user.id);
      if (res.success) {
        alert('Booking cancelled successfully');
        const bookingsResult = await getUserBookings(userResult.user.id);
        if (bookingsResult.success) setBookings(bookingsResult.bookings);
      } else {
        alert('Failed to cancel booking: ' + (res.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Cancel handler error:', error);
      alert('Error cancelling booking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PG Finder</h1>
                <p className="text-sm text-indigo-100">User Dashboard</p>
                {currentUser && (
                  <p className="text-xs text-indigo-200">Welcome, {currentUser.fullName}</p>
                )}
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all duration-300 flex items-center"
              >
                Delete Account
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {currentUser?.fullName || 'User'}! 👋</h2>
          <p className="text-gray-600">Manage your PG bookings and view your stay history.</p>
        </div>


        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
                             {[
                 { id: 'overview', name: 'Overview', icon: Home },
                 { id: 'search', name: 'Search PGs', icon: Search },
                 { id: 'bookings', name: 'Bookings', icon: Calendar },
                 { id: 'history', name: 'Stay History', icon: Clock },
                 // Rent Due tab removed
                 { id: 'notifications', name: 'Notifications', icon: Bell }
               ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex items-center gap-2">
                      <span>{tab.name}</span>
                      {tab.id === 'notifications' && unreadCount > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{booking.pgName}</h4>
                            <p className="text-sm text-gray-600">{booking.checkIn} - {booking.checkOut}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm">{booking.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                                 <div>
                   <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <Link href="/pgs" className="bg-indigo-50 text-indigo-700 p-4 rounded-lg hover:bg-indigo-100 transition-colors text-center">
                       <Search className="w-6 h-6 mx-auto mb-2" />
                       <span className="text-sm font-medium">Browse PGs</span>
                     </Link>
                     <button 
                       onClick={() => setActiveTab('search')}
                       className="bg-indigo-50 text-indigo-700 p-4 rounded-lg hover:bg-indigo-100 transition-colors"
                     >
                       <Search className="w-6 h-6 mx-auto mb-2" />
                       <span className="text-sm font-medium">Search PGs</span>
                     </button>
                     <button className="bg-purple-50 text-purple-700 p-4 rounded-lg hover:bg-purple-100 transition-colors">
                       <Receipt className="w-6 h-6 mx-auto mb-2" />
                       <span className="text-sm font-medium">View Receipts</span>
                     </button>
                    {/* Favorites quick action removed per request */}
                   </div>
                                  </div>
               </div>
             )}

             {/* Search Tab */}
             {activeTab === 'search' && (
               <div className="space-y-6">
                 <div>
                   <h3 className="text-xl font-bold text-gray-800 mb-4">Search for PGs</h3>
                   <p className="text-gray-600 mb-6">Find your perfect PG accommodation with advanced filters.</p>
                   
                   {/* Search Form */}
                   <div className="bg-gray-50 rounded-xl p-6 mb-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                       <div className="relative">
                         <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                         <input
                           type="text"
                           placeholder="Location..."
                           value={searchFilters.location}
                           onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300"
                         />
                       </div>
                       
                       <select
                         value={searchFilters.gender}
                         onChange={(e) => setSearchFilters({...searchFilters, gender: e.target.value})}
                         className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300"
                       >
                         <option value="">Select Gender</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Unisex">Unisex</option>
                       </select>

                       <input
                         type="text"
                         placeholder="Budget..."
                         value={searchFilters.budget}
                         onChange={(e) => setSearchFilters({...searchFilters, budget: e.target.value})}
                         className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300"
                       />

                       <select
                         value={searchFilters.roomType}
                         onChange={(e) => setSearchFilters({...searchFilters, roomType: e.target.value})}
                         className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300"
                       >
                         <option value="">Room Type</option>
                         <option value="Single Room">Single Room</option>
                         <option value="Single Sharing">Single Sharing</option>
                         <option value="Double Sharing">Double Sharing</option>
                         <option value="Triple Sharing">Triple Sharing</option>
                       </select>
                     </div>
                     
                     <div className="flex gap-4">
                       <button 
                         onClick={() => {
                           // Load properties for feed when search is clicked
                           if (properties.length === 0) {
                             loadPropertiesForFeed();
                           }
                         }}
                         className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center"
                       >
                         <Search className="w-5 h-5 mr-2" />
                         {properties.length === 0 ? 'Load PGs' : 'Search PGs'}
                       </button>
                       <button 
                         onClick={() => setSearchFilters({
                           location: '',
                           gender: '',
                           budget: '',
                           roomType: '',
                           foodIncluded: ''
                         })}
                         className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
                       >
                         Clear Filters
                       </button>
                     </div>
                   </div>
                 </div>

                 {/* Search Results */}
                 <div>
                   <h3 className="text-xl font-bold text-gray-800 mb-4">Available PGs ({properties.length})</h3>
                   {searchLoading ? (
                     <div className="text-center py-8">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                       <p className="mt-4 text-gray-600">Loading PGs...</p>
                     </div>
                   ) : properties.length === 0 ? (
                     <div className="text-center py-8 text-gray-500">
                       <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                       <p>Click &quot;Load PGs&quot; to see available properties in your feed.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                       {properties
                         .filter(pg => {
                           // Apply filters
                           if (searchFilters.location && !pg.location.toLowerCase().includes(searchFilters.location.toLowerCase())) return false;
                           if (searchFilters.gender && pg.gender !== searchFilters.gender && pg.gender !== 'Unisex') return false;
                           if (searchFilters.roomType && pg.roomType !== searchFilters.roomType) return false;
                           if (searchFilters.budget && pg.price > parseInt(searchFilters.budget)) return false;
                           return true;
                         })
                         .map((pg) => (
                           <div key={pg.id} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                             <div className="flex items-start justify-between mb-4">
                               <div>
                                 <h4 className="text-lg font-semibold text-gray-800">{pg.pgName || pg.name}</h4>
                                 <div className="flex items-center text-gray-600 mt-1">
                                   <MapPin className="w-4 h-4 mr-1" />
                                   <span className="text-sm">{pg.location}</span>
                                 </div>
                               </div>
                               <button
                                 onClick={() => toggleFavorite(pg.id)}
                                 className={`p-2 rounded-full transition-all duration-300 ${
                                   favorites.includes(pg.id)
                                     ? 'text-red-500 bg-red-50'
                                     : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                 }`}
                               >
                                 <Heart className={`w-5 h-5 ${favorites.includes(pg.id) ? 'fill-current' : ''}`} />
                               </button>
                             </div>
                             
                             <div className="flex items-center justify-between mb-4">
                               <span className="text-2xl font-bold text-indigo-600">₹{pg.price?.toLocaleString() || pg.price}</span>
                               <div className="flex items-center">
                                 <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                 <span className="ml-1 text-sm font-medium">{pg.rating}</span>
                               </div>
                             </div>

                             <div className="mb-4">
                               <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                 <span>Room: {pg.roomType}</span>
                                 <span>Gender: {pg.gender}</span>
                               </div>
                             </div>

                             {/* Amenities */}
                             <div className="mb-4">
                               <div className="flex flex-wrap gap-2">
                                 {pg.amenities.slice(0, 3).map((amenity, index) => (
                                   <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                     {amenity}
                                   </span>
                                 ))}
                                 {pg.amenities.length > 3 && (
                                   <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                     +{pg.amenities.length - 3} more
                                   </span>
                                 )}
                               </div>
                             </div>

                             <div className="flex gap-2">
                               <Link href="/pgs" className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center">
                                 View Details
                               </Link>
                               <button 
                                 onClick={() => bookPG(pg)}
                                 className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                               >
                                 Book PG
                               </button>
                             </div>
                           </div>
                         ))}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Current Bookings</h3>
        {visibleBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No active bookings found.</p>
                    <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      Search for PGs
                    </button>
                  </div>
        ) : (
                  <div className="space-y-4">
          {visibleBookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{booking.pgName}</h4>
                            <p className="text-sm text-gray-600">{booking.checkIn} - {booking.checkOut}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <button className="text-indigo-600 hover:text-indigo-700">
                              <Eye className="w-4 h-4" />
                            </button>
                              {(['confirmed','paid','active'].includes(((booking.status || '') + '').toLowerCase())) ? (
                                <button onClick={() => handleCancel(booking.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
                              ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stay History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Booking History</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No booking history found.</p>
                    <button 
                      onClick={() => setActiveTab('search')}
                      className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Search for PGs
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{booking.propertyName || booking.pgName}</h4>
                            <p className="text-sm text-gray-600">{booking.location}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Check-in</p>
                            <p className="font-medium text-black">{new Date(booking.checkIn).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Check-out</p>
                            <p className="font-medium text-black">{new Date(booking.checkOut).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Room Type</p>
                            <p className="font-medium">{booking.roomType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Amount (per head)</p>
                            <p className="font-medium">₹{booking.rentAmount?.toLocaleString?.() || booking.rentAmount} <span className="text-xs text-gray-500">/head</span></p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Booking Date: {new Date(booking.createdAt?.toDate()).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {(['confirmed','paid','active'].includes(((booking.status || '') + '').toLowerCase())) ? (
                              <button onClick={() => handleCheckout(booking.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Check out</button>
                            ) : null}
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                              View Details
                            </button>
                          </div>
                        </div>

                        {booking.review ? (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-700 italic">&ldquo;{booking.review}&rdquo;</p>
                          </div>
                        ) : ((booking.status || '').toLowerCase() === 'completed') ? (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Leave feedback for this PG</h4>
                            <textarea
                              value={(reviewInputs[booking.id] && reviewInputs[booking.id].text) || ''}
                              onChange={(e) => setReviewInputs(prev => ({ ...prev, [booking.id]: { ...(prev[booking.id] || {}), text: e.target.value } }))}
                              className="w-full p-2 border rounded-lg mb-2"
                              rows={3}
                              placeholder="Share your experience..."
                            />
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-sm text-gray-600 mr-2">Rating:</label>
                                <select
                                  value={(reviewInputs[booking.id] && reviewInputs[booking.id].rating) || 5}
                                  onChange={(e) => setReviewInputs(prev => ({ ...prev, [booking.id]: { ...(prev[booking.id] || {}), rating: Number(e.target.value) } }))}
                                  className="p-1 border rounded"
                                >
                                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                              </div>
                              <div>
                                <button onClick={() => handleSubmitReview(booking.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Submit Review</button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payments and Favorites tabs removed per request */}

            {/* Rent Due tab removed */}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Notifications</h3>
                {notifications.length > 0 && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={selectAllNotifs} onChange={toggleSelectAllNotifs} className="w-4 h-4" />
                      <span>Select all</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button onClick={handleDeleteSelected} disabled={selectedNotifIds.length === 0} className={`px-3 py-1.5 rounded-lg text-sm text-white ${selectedNotifIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>Delete selected</button>
                      <button onClick={handleDeleteAll} className="px-3 py-1.5 rounded-lg text-sm text-white bg-red-700 hover:bg-red-800">Delete all</button>
                    </div>
                  </div>
                )}
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`bg-gray-50 rounded-lg p-4 ${!notification.isRead ? 'border-l-4 border-indigo-500' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input type="checkbox" className="mt-1 w-4 h-4" checked={selectedNotifIds.includes(notification.id)} onChange={() => toggleSelectNotif(notification.id)} />
                            <div>
                              <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{new Date(notification.createdAt?.toDate()).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            )}
                            <button 
                              onClick={async () => {
                                try {
                                  if (!notification.isRead) {
                                    const res = await markNotificationAsRead(notification.id);
                                    if (res.success) {
                                      // update local state
                                      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                                      setUnreadCount(c => Math.max(0, c - 1));
                                    }
                                  } else {
                                    // lazy toggle to unread
                                    const { markNotificationAsUnread } = await import('@/lib/bookings');
                                    const res = await markNotificationAsUnread(notification.id);
                                    if (res.success) {
                                      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: false } : n));
                                      setUnreadCount(c => c + 1);
                                    }
                                  }
                                } catch (err) {
                                  console.error('Toggle notification read error:', err);
                                }
                              }}
                              className="text-indigo-600 hover:text-indigo-700 text-sm"
                            >
                              {notification.isRead ? 'Mark as unread' : 'Mark as read'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}
