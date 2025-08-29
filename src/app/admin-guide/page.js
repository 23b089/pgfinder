'use client';

export default function AdminGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            🛡️ PG Finder Admin Guide
          </h1>
          
          {/* Admin Access Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">🔐 Super Admin Access</h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 font-medium">Admin access is restricted to system creators only!</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">How to Create Admin Account:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Go to the <strong>Signup Page</strong></li>
              <li>Look for a tiny dot (.) at the bottom of the page</li>
              <li>Click on the dot - it will prompt for a secret code</li>
              <li>Enter: <code className="bg-gray-200 px-2 py-1 rounded">PGFINDER_ADMIN_2024</code></li>
              <li>Admin account will be created with credentials shown</li>
            </ol>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
              <p className="text-yellow-700">
                <strong>Note:</strong> Only one admin account can exist. If someone else has already created it, you cannot create another.
              </p>
            </div>
          </section>

          {/* Admin Powers Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">⚡ Admin Powers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">👥 User Management</h4>
                <ul className="text-green-700 space-y-1">
                  <li>• View all users and PG owners</li>
                  <li>• Suspend/activate accounts</li>
                  <li>• Delete users permanently</li>
                  <li>• Monitor user activity</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 System Analytics</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>• Total users count</li>
                  <li>• Total PG owners count</li>
                  <li>• Revenue monitoring</li>
                  <li>• Platform health status</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🏠 Property Control</h4>
                <ul className="text-purple-700 space-y-1">
                  <li>• Approve/reject PG listings</li>
                  <li>• Monitor property quality</li>
                  <li>• Handle owner requests</li>
                  <li>• Platform compliance</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">🚨 Issue Management</h4>
                <ul className="text-red-700 space-y-1">
                  <li>• Handle user complaints</li>
                  <li>• Resolve disputes</li>
                  <li>• Manage bug reports</li>
                  <li>• System maintenance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Roles Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">👤 User Roles</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <h4 className="font-semibold text-green-800">👤 Regular Users</h4>
                <p className="text-green-700">Students and professionals looking for PG accommodation. They can search, filter, and contact PG owners.</p>
              </div>
              
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-800">🏠 PG Owners</h4>
                <p className="text-blue-700">Property owners who list their PGs. They can manage properties, bookings, and handle customer inquiries.</p>
              </div>
              
              <div className="border-l-4 border-red-500 bg-red-50 p-4">
                <h4 className="font-semibold text-red-800">🛡️ Super Admins</h4>
                <p className="text-red-700">System administrators with full control over the platform. Only accessible to system creators.</p>
              </div>
            </div>
          </section>

          {/* Security Features */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔒 Security Features</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li>✅ <strong>Role-based access control</strong> - Users can only access their designated areas</li>
                <li>✅ <strong>Secret admin creation</strong> - Only system creators can become admins</li>
                <li>✅ <strong>Authentication checks</strong> - All pages verify user permissions</li>
                <li>✅ <strong>One admin limit</strong> - Prevents multiple admin accounts</li>
                <li>✅ <strong>Secure logout</strong> - Clears all session data</li>
              </ul>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚀 Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                🏠 Go to Home
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                🛡️ Create Admin Account
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔐 Login
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

