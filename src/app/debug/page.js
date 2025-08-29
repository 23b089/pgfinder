'use client';
import { useState, useEffect } from 'react';
import { Users, Database, Eye, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedUsers = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    const currentUserData = JSON.parse(localStorage.getItem('pgfinder_current_user') || 'null');
    
    setUsers(storedUsers);
    setCurrentUser(currentUserData);
  };

  const createTestAccounts = () => {
    const testUsers = [
      {
        id: 'owner_001',
        fullName: 'Rajesh Kumar',
        email: 'owner@pgfinder.com',
        phone: '+91 9876543210',
        password: 'Owner@123',
        role: 'owner',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        properties: []
      },
      {
        id: 'user_001',
        fullName: 'Priya Sharma',
        email: 'user@pgfinder.com',
        phone: '+91 8765432109',
        password: 'User@123',
        role: 'user',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        favorites: []
      },
      {
        id: 'admin_001',
        fullName: 'System Administrator',
        email: 'admin@pgfinder.com',
        phone: '+91 0000000000',
        password: 'SuperAdmin@2024',
        role: 'admin',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      }
    ];

    localStorage.setItem('pgfinder_users', JSON.stringify(testUsers));
    setUsers(testUsers);
    setMessage('✅ Test accounts created successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const clearAllData = () => {
    localStorage.removeItem('pgfinder_users');
    localStorage.removeItem('pgfinder_current_user');
    setUsers([]);
    setCurrentUser(null);
    setMessage('🗑️ All data cleared!');
    setTimeout(() => setMessage(''), 3000);
  };

  const testLogin = (email, password, role) => {
    const storedUsers = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    const user = storedUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      if (user.role === role) {
        localStorage.setItem('pgfinder_current_user', JSON.stringify(user));
        setCurrentUser(user);
        setMessage(`✅ Login successful! Welcome ${user.fullName}`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ Role mismatch! User is registered as ${user.role}, not ${role}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      setMessage('❌ Invalid email or password!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Debug & Troubleshoot
          </h1>
          <p className="text-gray-600 mt-2">Check localStorage and test login functionality</p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-center">
            <span className="text-lg font-medium text-gray-700">{message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={createTestAccounts}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Create Test Accounts
            </button>
            
            <button
              onClick={loadData}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh Data
            </button>
            
            <button
              onClick={clearAllData}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </button>
            
            <Link
              href="/login"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Go to Login
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Users in localStorage */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Users in localStorage ({users.length})
            </h2>
            
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No users found in localStorage</p>
                <p className="text-sm">Click "Create Test Accounts" to add test users</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user, index) => (
                  <div key={user.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'owner' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Password:</strong> {user.password}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <p><strong>Status:</strong> {user.status}</p>
                    </div>
                    
                    {/* Quick Login Test Buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => testLogin(user.email, user.password, user.role)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                      >
                        Test Login
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${user.email}\n${user.password}`);
                          setMessage('📋 Credentials copied!');
                          setTimeout(() => setMessage(''), 2000);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        Copy Credentials
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current User */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Current User
            </h2>
            
            {currentUser ? (
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{currentUser.fullName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentUser.role === 'admin' ? 'bg-red-100 text-red-700' :
                    currentUser.role === 'owner' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Phone:</strong> {currentUser.phone}</p>
                  <p><strong>Status:</strong> {currentUser.status}</p>
                  <p><strong>Join Date:</strong> {currentUser.joinDate}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/dashboard/${currentUser.role}`}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('pgfinder_current_user');
                      setCurrentUser(null);
                      setMessage('👋 Logged out successfully!');
                      setTimeout(() => setMessage(''), 2000);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No user currently logged in</p>
                <p className="text-sm">Use the test login buttons above or go to the login page</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Test Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Login Tests</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => testLogin('user@pgfinder.com', 'User@123', 'user')}
              className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <div className="font-semibold">Test User Login</div>
              <div className="text-sm opacity-90">user@pgfinder.com</div>
            </button>
            
            <button
              onClick={() => testLogin('owner@pgfinder.com', 'Owner@123', 'owner')}
              className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <div className="font-semibold">Test Owner Login</div>
              <div className="text-sm opacity-90">owner@pgfinder.com</div>
            </button>
            
            <button
              onClick={() => testLogin('admin@pgfinder.com', 'SuperAdmin@2024', 'admin')}
              className="bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              <div className="font-semibold">Test Admin Login</div>
              <div className="text-sm opacity-90">admin@pgfinder.com</div>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
