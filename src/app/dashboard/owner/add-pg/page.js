`Example: NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here`;'use client';
import { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Wifi, 
  UtensilsCrossed, 
  Car, 
  Droplets, 
  Zap, 
  Shield, 
  Users, 
  MapPin, 
  Home,
  Save,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addProperty } from '@/lib/properties';

const sharingTypes = [
  'Single Room',
  'Single Sharing',
  'Double Sharing', 
  'Triple Sharing',
  'Quad Sharing'
];

const availableFeatures = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'food', label: 'Food Included', icon: UtensilsCrossed },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'ac', label: 'AC', icon: Zap },
  { id: 'laundry', label: 'Laundry', icon: Droplets },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'gym', label: 'Gym', icon: Users }
];

const genderOptions = [
  'Male',
  'Female', 
  'Unisex'
];

export default function AddPG() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    pgName: '',
    location: '',
    sharingType: 'Single Room',
  qrCodeUrl: '',
    totalRooms: 1,
    price: '',
    gender: 'Unisex',
    description: '',
    features: [],
    amenities: []
  });

  const [errors, setErrors] = useState({});

  // Check authentication on component mount
  useState(() => {
    const checkAuth = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth');
        const userResult = await getCurrentUser();
        
        if (!userResult.success || !userResult.user) {
          alert('Please login to access this page');
          router.push('/login');
          return;
        }
        
        if (userResult.user.role !== 'owner') {
          alert('Access denied! Only PG owners can add properties.');
          router.push('/dashboard/user');
          return;
        }
        
        setCurrentUser(userResult.user);
      } catch (error) {
        console.error('Error checking authentication:', error);
        alert('Please login to access this page');
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const addAmenity = () => {
    const amenity = prompt('Enter amenity name:');
    if (amenity && amenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity.trim()]
      }));
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pgName.trim()) {
      newErrors.pgName = 'PG name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.totalRooms || formData.totalRooms <= 0) {
      newErrors.totalRooms = 'Valid room count is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!currentUser) {
      alert('Please login to add a PG');
      return;
    }
    
    setLoading(true);
    
    try {
      const propertyData = {
        ...formData,
        price: parseInt(formData.price),
        totalRooms: parseInt(formData.totalRooms),
        // Initialize slots based on totalRooms * roomCapacity (roomCapacity inferred from sharingType)
        roomType: formData.sharingType,
        roomCapacity: formData.sharingType && formData.sharingType.toLowerCase().includes('double') ? 2 : (formData.sharingType && formData.sharingType.toLowerCase().includes('triple') ? 3 : 1),
        availableRooms: parseInt(formData.totalRooms),
        // Map features to amenities for display
        amenities: [
          ...formData.features.map(f => availableFeatures.find(af => af.id === f)?.label).filter(Boolean),
          ...formData.amenities
        ]
      };
      
      const result = await addProperty(propertyData, currentUser.id);
      
      if (result.success) {
        alert('PG added successfully!');
        router.push('/dashboard/owner');
      } else {
        alert('Error adding PG: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding PG:', error);
      alert('Error adding PG. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/owner" className="hover:text-green-200 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Add New PG</h1>
                <p className="text-sm text-green-100">Create a new PG listing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PG Name *
                    </label>
                    <input
                      type="text"
                      value={formData.pgName}
                      onChange={(e) => handleInputChange('pgName', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300 ${
                        errors.pgName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter PG name"
                    />
                    {errors.pgName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.pgName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Code URL (for payments)</label>
                    <input
                      type="text"
                      value={formData.qrCodeUrl}
                      onChange={(e) => handleInputChange('qrCodeUrl', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300 border-gray-300"
                      placeholder="https://... (image or payment link)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: add a QR code image URL or UPI link to display to users for manual payments.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300 ${
                          errors.location ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter location"
                      />
                    </div>
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sharing Type
                    </label>
                    <select
                      value={formData.sharingType}
                      onChange={(e) => handleInputChange('sharingType', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300"
                    >
                      {sharingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Rooms Available *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalRooms}
                      onChange={(e) => handleInputChange('totalRooms', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300 ${
                        errors.totalRooms ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Number of rooms"
                    />
                    {errors.totalRooms && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.totalRooms}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent per Head (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300 ${
                          errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter monthly rent per head"
                      />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender Preference
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300"
                    >
                      {genderOptions.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-green-600" />
                  Features & Amenities
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Available Features
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableFeatures.map(feature => {
                        const Icon = feature.icon;
                        const isSelected = formData.features.includes(feature.id);
                        
                        return (
                          <button
                            key={feature.id}
                            type="button"
                            onClick={() => toggleFeature(feature.id)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center space-y-2 ${
                              isSelected
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                            }`}
                          >
                            <Icon className={`w-6 h-6 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-sm font-medium">{feature.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Additional Amenities
                    </label>
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={addAmenity}
                        className="flex items-center text-green-600 hover:text-green-700 font-medium"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Amenity
                      </button>
                      
                      {formData.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                              {amenity}
                              <button
                                type="button"
                                onClick={() => removeAmenity(index)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Description
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PG Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 focus:outline-none transition-all duration-300"
                    placeholder="Describe your PG, rules, policies, etc."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard/owner"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding PG...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add PG
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
