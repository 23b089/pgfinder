'use client';
import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Filter, 
  Heart, 
  Eye, 
  Phone, 
  Mail,
  SlidersHorizontal,
  Grid3X3,
  List
} from "lucide-react";
import Link from "next/link";

export default function PGsListing() {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    gender: '',
    budget: '',
    roomType: '',
    foodIncluded: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState(['1', '3']);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pgfinder_current_user'));
    setCurrentUser(user);
  }, []);

  const mockPGs = [
    {
      id: '1',
      name: 'Green Valley PG',
      location: 'Koramangala, Bangalore',
      price: '₹12,000',
      rating: 4.8,
      reviews: 156,
      amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Parking'],
      roomType: 'Single Sharing',
      gender: 'Male',
      image: '/api/placeholder/300/200',
      owner: 'Rajesh Kumar',
      phone: '+91 9876543210',
      description: 'Modern PG with all amenities, located in the heart of Koramangala. Perfect for students and working professionals.',
      distance: '2.5 km from Metro',
      availableRooms: 3
    },
    {
      id: '2',
      name: 'Comfort Stay PG',
      location: 'HSR Layout, Bangalore',
      price: '₹8,500',
      rating: 4.2,
      reviews: 89,
      amenities: ['WiFi', 'Food', 'Laundry'],
      roomType: 'Double Sharing',
      gender: 'Female',
      image: '/api/placeholder/300/200',
      owner: 'Priya Sharma',
      phone: '+91 9876543211',
      description: 'Comfortable and affordable PG accommodation with good food and clean rooms.',
      distance: '1.8 km from Bus Stop',
      availableRooms: 5
    },
    {
      id: '3',
      name: 'Elite Residence PG',
      location: 'Indiranagar, Bangalore',
      price: '₹15,000',
      rating: 4.9,
      reviews: 203,
      amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Gym'],
      roomType: 'Single Room',
      gender: 'Unisex',
      image: '/api/placeholder/300/200',
      owner: 'Amit Patel',
      phone: '+91 9876543212',
      description: 'Premium PG with luxury amenities including gym, AC rooms, and 24/7 security.',
      distance: '0.5 km from Metro',
      availableRooms: 2
    },
    {
      id: '4',
      name: 'Student Haven PG',
      location: 'JP Nagar, Bangalore',
      price: '₹7,500',
      rating: 4.0,
      reviews: 67,
      amenities: ['WiFi', 'Food', 'Study Room'],
      roomType: 'Triple Sharing',
      gender: 'Male',
      image: '/api/placeholder/300/200',
      owner: 'Suresh Kumar',
      phone: '+91 9876543213',
      description: 'Student-friendly PG with study rooms and quiet environment for focused learning.',
      distance: '3.2 km from College',
      availableRooms: 8
    },
    {
      id: '5',
      name: 'Working Women PG',
      location: 'Whitefield, Bangalore',
      price: '₹11,000',
      rating: 4.6,
      reviews: 134,
      amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Security'],
      roomType: 'Single Sharing',
      gender: 'Female',
      image: '/api/placeholder/300/200',
      owner: 'Lakshmi Devi',
      phone: '+91 9876543214',
      description: 'Safe and secure PG exclusively for working women with 24/7 security.',
      distance: '1.2 km from IT Park',
      availableRooms: 4
    },
    {
      id: '6',
      name: 'Budget Friendly PG',
      location: 'Electronic City, Bangalore',
      price: '₹6,500',
      rating: 3.8,
      reviews: 45,
      amenities: ['WiFi', 'Food'],
      roomType: 'Double Sharing',
      gender: 'Unisex',
      image: '/api/placeholder/300/200',
      owner: 'Ramesh Singh',
      phone: '+91 9876543215',
      description: 'Affordable PG accommodation perfect for budget-conscious students and professionals.',
      distance: '2.8 km from Tech Park',
      availableRooms: 6
    }
  ];

  const toggleFavorite = (pgId) => {
    setFavorites(prev => 
      prev.includes(pgId) 
        ? prev.filter(id => id !== pgId)
        : [...prev, pgId]
    );
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log('Searching with filters:', searchFilters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="hover:text-indigo-200 transition-colors">
                <Users className="w-6 h-6" />
              </Link>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PG Finder</h1>
                <p className="text-sm text-indigo-100">Find Your Perfect PG</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {currentUser ? (
                <>
                  <Link href="/dashboard/user" className="hover:text-indigo-200 transition-colors">
                    Dashboard
                  </Link>
                  <span className="text-indigo-200">Welcome, {currentUser.fullName}</span>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-indigo-200 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Find Your Perfect PG</h2>
            <p className="text-gray-600 mb-6">Search and filter through hundreds of verified PG accommodations.</p>
            
            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location..."
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-gray-50 hover:bg-white transition-all duration-300"
                />
              </div>
              
              <select
                value={searchFilters.gender}
                onChange={(e) => setSearchFilters({...searchFilters, gender: e.target.value})}
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-gray-50 hover:bg-white transition-all duration-300"
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
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-gray-50 hover:bg-white transition-all duration-300"
              />

              <select
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({...searchFilters, roomType: e.target.value})}
                className="w-full pl-4 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none text-black bg-gray-50 hover:bg-white transition-all duration-300"
              >
                <option value="">Room Type</option>
                <option value="Single Room">Single Room</option>
                <option value="Single Sharing">Single Sharing</option>
                <option value="Double Sharing">Double Sharing</option>
                <option value="Triple Sharing">Triple Sharing</option>
              </select>

              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PG Listings */}
      <section className="px-6 pb-12">
        <div className="container mx-auto">
          {/* Filters and View Options */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-bold text-gray-800">Available PGs ({mockPGs.length})</h3>
              <button className="flex items-center px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Sort by: Price (Low to High)</option>
                <option>Sort by: Price (High to Low)</option>
                <option>Sort by: Rating</option>
                <option>Sort by: Distance</option>
              </select>
            </div>
          </div>

          {/* PG Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockPGs.map((pg) => (
                <div key={pg.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* PG Image */}
                  <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-lg font-semibold">PG Image</div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(pg.id)}
                      className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
                        favorites.includes(pg.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(pg.id) ? 'fill-current' : ''}`} />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {pg.availableRooms} spaces available
                    </div>
                  </div>

                  {/* PG Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xl font-semibold text-gray-800">{pg.name}</h4>
                      <span className="text-2xl font-bold text-indigo-600">{pg.price}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{pg.location}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{pg.rating}</span>
                        <span className="ml-1 text-sm text-gray-600">({pg.reviews} reviews)</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pg.description}</p>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Room: {pg.roomType}</span>
                        <span>Gender: {pg.gender}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>{pg.distance}</span>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {pg.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {pg.amenities.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{pg.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </button>
                    </div>

                    {/* Owner Info */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Owner: {pg.owner}</span>
                        <span>{pg.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {mockPGs.map((pg) => (
                <div key={pg.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-6">
                    {/* PG Image */}
                    <div className="relative w-48 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <div className="text-white text-sm font-semibold">PG Image</div>
                      <button
                        onClick={() => toggleFavorite(pg.id)}
                        className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-300 ${
                          favorites.includes(pg.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(pg.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* PG Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{pg.name}</h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">{pg.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-indigo-600">{pg.price}</span>
                          <div className="text-sm text-green-600 font-medium">{pg.availableRooms} spaces available</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{pg.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">{pg.rating}</span>
                            <span className="ml-1 text-sm text-gray-600">({pg.reviews} reviews)</span>
                          </div>
                          <span className="text-sm text-gray-600">{pg.roomType}</span>
                          <span className="text-sm text-gray-600">{pg.gender}</span>
                          <span className="text-sm text-gray-600">{pg.distance}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pg.amenities.slice(0, 6).map((amenity, index) => (
                          <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Owner: {pg.owner}</span>
                          <span>•</span>
                          <span>{pg.phone}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            View Details
                          </button>
                          <button className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
                            Call Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          <div className="text-center mt-8">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300">
              Load More PGs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
