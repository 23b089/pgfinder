
import { Search, MapPin, Star, Users, Wifi, Car, UtensilsCrossed, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
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
              <h1 className="text-2xl font-bold">PG Finder</h1>
            </div>
            <nav className="hidden md:flex space-x-6 flex-nowrap items-center">
              <a href="#features" className="hover:text-indigo-200 transition-colors">Features</a>
              <a href="#about" className="hover:text-indigo-200 transition-colors">About</a>
              <a href="#contact" className="hover:text-indigo-200 transition-colors">Contact</a>
              <Link href="/signup" className="hover:text-indigo-200 transition-colors">Sign Up</Link>
              <Link href="/login" className="hover:text-indigo-200 transition-colors">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Find Your Perfect PG
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover comfortable, affordable, and convenient paying guest accommodations near you. 
              From budget-friendly options to premium stays, we&apos;ve got you covered.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/pgs" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg flex items-center">
                Browse PGs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/login" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg border-2 border-indigo-600">
                Sign In
              </Link>
            </div>
            
            {/* Search Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto opacity-75">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Enter location, area, or landmark..."
                    disabled
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex-1 relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select disabled className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg bg-gray-100 text-gray-500 cursor-not-allowed">
                    <option>Select Gender</option>
                  </select>
                </div>
                <button disabled className="bg-gray-300 text-gray-500 px-8 py-4 rounded-xl font-semibold cursor-not-allowed text-lg">
                  <Search className="w-5 h-5 inline mr-2" />
                  Search PGs
                </button>
              </div>
              <div className="text-center mt-4">
                <p className="text-gray-500 text-sm">Sign in to access the full search functionality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-16">
            Why Choose Our PG Finder?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Verified Locations</h4>
              <p className="text-gray-600">All PGs are personally verified and located in safe, convenient areas.</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Top Rated</h4>
              <p className="text-gray-600">Browse through thousands of reviews and ratings from real tenants.</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Modern Amenities</h4>
              <p className="text-gray-600">Find PGs with WiFi, AC, food, and other essential amenities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-16">
            Popular Areas
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {['Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Marathahalli', 'Whitefield', 'JP Nagar', 'Banashankari'].map((area, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800">{area}</h4>
                <p className="text-sm text-gray-600 mt-1">50+ PGs available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Find Your Perfect PG?
          </h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who found their ideal accommodation through PG Finder.
          </p>
          <Link href="/login" className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center">
            Start Searching Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">PG Finder</h4>
              <p className="text-gray-400">Your trusted partner in finding the perfect paying guest accommodation.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PG Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PG Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
