'use client';
import { useState, useEffect } from 'react';
import { Users, Database, Eye, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function DebugLogin() {
  const [users, setUsers] = useState([]);
  const [testEmail, setTestEmail] = useState('user@pgfinder.com');
  const [testPassword, setTestPassword] = useState('User@123');
  const [loginResult, setLoginResult] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    setUsers(storedUsers);
  };

  const createTestUser = () => {
    const testUser = {
      id: 'user_001',
      fullName: 'Priya Sharma',
      email: 'user@pgfinder.com',
      phone: '+91 8765432109',
      password: 'User@123',
      role: 'user',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      favorites: [],
      bookings: []
    };

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    
    // Remove if exists
    const filteredUsers = existingUsers.filter(user => user.email !== testUser.email);
    
    // Add test user
    filteredUsers.push(testUser);
    
    // Save to localStorage
    localStorage.setItem('pgfinder_users', JSON.stringify(filteredUsers));
    
    setMessage('✅ Test user created successfully!');
    loadUsers();
  };

  const testLogin = () => {
    const users = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    const user = users.find(u => u.email === testEmail && u.password === testPassword);
    
    if (user) {
      setLoginResult({
        success: true,
        user: user,
        message: 'Login successful!'
      });
    } else {
      setLoginResult({
        success: false,
        message: 'Login failed! User not found or password incorrect.'
      });
    }
  };

  const clearData = () => {
    localStorage.clear();
    setUsers([]);
    setLoginResult(null);
    setMessage('🗑️ All data cleared!');
  };

  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Login Debug Tool</h1>
              <p className="text-gray-600">Debug and test login functionality</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="text-center">
              <span className="text-sm font-medium text-gray-700">{message}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={createTestUser}
            className="bg-green-600 text-white p-4 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Create Test User
          </button>
          <button
            onClick={loadUsers}
            className="bg-blue-600 text-white p-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Data
          </button>
          <button
            onClick={clearData}
            className="bg-red-600 text-white p-4 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear All Data
          </button>
        </div>

        {/* Test Login Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Test Login</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>
          
          <button
            onClick={testLogin}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
          >
            Test Login
          </button>

          {/* Login Result */}
          {loginResult && (
            <div className={`mt-4 p-4 rounded-lg ${loginResult.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <div className="flex items-center space-x-2">
                {loginResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${loginResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {loginResult.message}
                </span>
              </div>
              {loginResult.success && loginResult.user && (
                <div className="mt-2 text-sm text-green-700">
                  <p>User: {loginResult.user.fullName}</p>
                  <p>Role: {loginResult.user.role}</p>
                  <p>Email: {loginResult.user.email}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">👥 Registered Users ({users.length})</h2>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found in localStorage</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Role: {user.role} | Password: {user.password}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'user' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'owner' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Quick Links</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/login"
              className="bg-blue-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              Login Page
            </Link>
            <Link
              href="/test-user-accounts"
              className="bg-green-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-green-700 transition-all duration-300"
            >
              Test Accounts
            </Link>
            <Link
              href="/dashboard/user"
              className="bg-purple-600 text-white p-3 rounded-lg text-center font-semibold hover:bg-purple-700 transition-all duration-300"
            >
              User Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
