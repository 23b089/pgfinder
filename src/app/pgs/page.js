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
  Bell,
  Plus,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { getPropertiesForFeed } from '@/lib/properties';
import { createBooking } from '@/lib/bookings';

export default function PGsPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    gender: '',
  minPrice: '',
  maxPrice: '',
    roomType: '',
    foodIncluded: ''
  });

  // Check authentication and load data on component mount
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        // Get current user from Firebase auth
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        
        if (userResult.success && userResult.user) {
          setCurrentUser(userResult.user);
        }
        
        // Load properties
        await loadProperties();
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuthAndLoadData();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const result = await getPropertiesForFeed();
      if (result.success) {
        setProperties(result.properties);
      } else {
        console.error('Failed to load properties:', result.error);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
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
    if (currentUser.role !== 'user') {
      alert('Only users can book PGs');
      return;
    }
    const occupants = 1;
    const bookingData = {
      userId: currentUser.id,
      userName: currentUser.name || currentUser.displayName || currentUser.email,
      propertyId: pg.id,
      propertyName: pg.pgName || pg.name,
      ownerId: pg.ownerId,
      location: pg.location,
      roomType: pg.roomType || pg.sharingType,
      occupants,
      rentAmount: pg.price,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: null
    };
    const res = await createBooking(bookingData);
    if (res.success) {
      alert('Booking request sent!');
      router.push('/dashboard/user');
    } else {
      alert(res.error || 'Failed to create booking');
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

  const filteredProperties = properties.filter(pg => {
    // Apply filters
    if (searchFilters.location && !pg.location.toLowerCase().includes(searchFilters.location.toLowerCase())) return false;
    if (searchFilters.gender && pg.gender !== searchFilters.gender && pg.gender !== 'Unisex') return false;
    if (searchFilters.roomType && pg.roomType !== searchFilters.roomType) return false;
    if (searchFilters.minPrice && pg.price < parseInt(searchFilters.minPrice)) return false;
    if (searchFilters.maxPrice && pg.price > parseInt(searchFilters.maxPrice)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">PG Finder</h1>
                <p className="text-xs sm:text-sm text-indigo-100 hidden sm:block">Find Your Perfect PG</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {currentUser ? (
                <>
                  <Link href="/dashboard/user" className="hover:text-indigo-200 transition-colors flex items-center text-sm">
                    <User className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link href="/" className="bg-white/20 hover:bg-white/30 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 flex items-center text-sm">
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-indigo-200 transition-colors text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-white/20 hover:bg-white/30 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 text-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              {currentUser ? (
                <>
                  <Link href="/dashboard/user" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all" title="Dashboard">
                    <User className="w-4 h-4" />
                  </Link>
                  <Link href="/" className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all" title="Logout">
                    <LogOut className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                    Login
                  </Link>
                  <Link href="/signup" className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
            Search & Filter PGs
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Location..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
              />
            </div>
            
            <select
              value={searchFilters.gender}
              onChange={(e) => setSearchFilters({...searchFilters, gender: e.target.value})}
              className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Min budget"
              value={searchFilters.minPrice}
              onChange={(e) => setSearchFilters({...searchFilters, minPrice: e.target.value})}
              className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-white hover:bg-gray-50 transition-all duration-300"
            />

            <input
              type="number"
              min="0"
              placeholder="Max budget"
              value={searchFilters.maxPrice}
              onChange={(e) => setSearchFilters({...searchFilters, maxPrice: e.target.value})}
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
              <option value="Quad Sharing">Quad Sharing</option>
              <option value="Penta Sharing (5)">Penta Sharing (5)</option>
              <option value="Hexa Sharing (6)">Hexa Sharing (6)</option>
              <option value="Septa Sharing (7)">Septa Sharing (7)</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={loadProperties}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center"
            >
              <Search className="w-5 h-5 mr-2" />
              Search PGs
            </button>
            <button 
              onClick={() => setSearchFilters({
                location: '',
                gender: '',
                minPrice: '',
                maxPrice: '',
                roomType: '',
                foodIncluded: ''
              })}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Available PGs ({filteredProperties.length})
            </h2>
            {currentUser?.role === 'owner' && (
              <Link href="/dashboard/owner/add-pg" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add PG
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading PGs...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No PGs Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later.</p>
              <button 
                onClick={loadProperties}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300"
              >
                Refresh Results
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProperties.map((pg) => (
                <div key={pg.id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">{pg.pgName || pg.name}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                        <span className="text-xs sm:text-sm truncate">{pg.location}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(pg.id)}
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ml-2 flex-shrink-0 ${
                        favorites.includes(pg.id)
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.includes(pg.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-indigo-600">₹{pg.price?.toLocaleString() || pg.price}</div>
                      <div className="text-xs text-gray-500">per month per head</div>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs sm:text-sm font-medium">{pg.rating || 4.5}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Room: {pg.roomType || pg.sharingType}</span>
                      <span>Gender: {pg.gender}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Available: {pg.availableSlots || 0} spaces</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pg.status)}`}>
                        {pg.status}
                      </span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {pg.amenities && pg.amenities.length > 0 && (
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
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/pgs/${pg.id}`} className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center text-sm sm:text-base">
                      View Details
                    </Link>
                    {currentUser?.role === 'user' && (
                      pg.availableSlots > 0 ? (
                        <button
                          onClick={() => bookPG(pg)}
                          className="bg-green-500 text-white py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center text-sm sm:text-base"
                        >
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Book PG
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 text-white py-2 px-4 rounded-lg font-medium cursor-not-allowed flex items-center"
                        >
                          <BookOpen className="w-4 h-4 mr-1" />
                          Full
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
