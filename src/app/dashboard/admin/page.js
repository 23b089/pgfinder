'use client';
import { useState, useEffect } from 'react';
import { Shield, Users, Home, DollarSign, BarChart3, Settings, Database, Activity, AlertTriangle, CheckCircle, XCircle, Eye, Edit, Trash2, Plus, Filter, Search, LogOut, Bell, UserX, FileText, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalPGs: 0,
    totalBookings: 0,
    monthlyRevenue: '₹0',
    activeUsers: 0,
    pendingApprovals: 0,
    reportedIssues: 0
  });

  // Check authentication and load data on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('pgfinder_current_user'));
    if (!user || user.role !== 'admin') {
      alert('Access denied! Only super admins can access this page.');
      window.location.href = '/login';
      return;
    }
    setCurrentUser(user);
    loadSystemData();
  }, []);

  const loadSystemData = () => {
    const users = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    setAllUsers(users);
    
    const userCount = users.filter(u => u.role === 'user').length;
    const ownerCount = users.filter(u => u.role === 'owner').length;
    const activeUserCount = users.filter(u => u.status === 'Active').length;
    
    setSystemStats({
      totalUsers: userCount,
      totalOwners: ownerCount,
      totalPGs: ownerCount * 2, // Assume each owner has 2 PGs on average
      totalBookings: userCount * 3, // Assume each user has 3 bookings on average
      monthlyRevenue: `₹${(ownerCount * 1.5 * 100000).toLocaleString()}`, // Estimated revenue
      activeUsers: activeUserCount,
      pendingApprovals: Math.floor(ownerCount * 0.2), // 20% pending
      reportedIssues: Math.floor(userCount * 0.01) // 1% report issues
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('pgfinder_current_user');
    window.location.href = '/';
  };

  const deleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const users = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('pgfinder_users', JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
      loadSystemData(); // Refresh stats
      alert('User deleted successfully!');
    }
  };

  const suspendUser = (userId) => {
    const users = JSON.parse(localStorage.getItem('pgfinder_users') || '[]');
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u
    );
    localStorage.setItem('pgfinder_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    loadSystemData();
    alert('User status updated successfully!');
  };





  const mockPGs = [
    {
      id: '1',
      name: 'Green Valley PG',
      owner: 'Rajesh Kumar',
      location: 'Koramangala, Bangalore',
      totalRooms: 20,
      occupancy: 90,
      status: 'Approved',
      revenue: '₹2,16,000',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Comfort Stay PG',
      owner: 'Suresh Patel',
      location: 'HSR Layout, Bangalore',
      totalRooms: 15,
      occupancy: 80,
      status: 'Pending',
      revenue: '₹1,02,000',
      rating: 4.2
    }
  ];

  const mockReports = [
    {
      id: '1',
      type: 'Complaint',
      title: 'Poor WiFi connectivity',
      reporter: 'Amit Kumar',
      pg: 'Green Valley PG',
      date: '2024-01-22',
      status: 'Open',
      priority: 'Medium'
    },
    {
      id: '2',
      type: 'Bug Report',
      title: 'Payment gateway error',
      reporter: 'System',
      pg: 'N/A',
      date: '2024-01-21',
      status: 'In Progress',
      priority: 'High'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PG Finder</h1>
                <p className="text-sm text-red-100">Super Admin Dashboard</p>
                {currentUser && (
                  <p className="text-xs text-red-200">Welcome, {currentUser.fullName}</p>
                )}
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#" className="hover:text-red-200 transition-colors flex items-center">
                <Bell className="w-4 h-4 mr-1" />
                Alerts
                <span className="ml-1 bg-yellow-500 text-xs px-2 py-1 rounded-full">5</span>
              </Link>
              <Link href="#" className="hover:text-red-200 transition-colors flex items-center">
                <Database className="w-4 h-4 mr-1" />
                System Health
              </Link>
              <Link href="#" className="hover:text-red-200 transition-colors flex items-center">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
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
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'properties', label: 'Property Management', icon: Home },
              { id: 'reports', label: 'Reports & Issues', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'system', label: 'System Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
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
              <h2 className="text-3xl font-bold text-gray-800 mb-2">System Overview 🎛️</h2>
              <p className="text-gray-600">Monitor and manage the entire PG Finder platform from here.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total PGs</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.totalPGs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.monthlyRevenue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300">
                    Review Pending Approvals ({systemStats.pendingApprovals})
                  </button>
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                    Handle Reported Issues ({systemStats.reportedIssues})
                  </button>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                    Generate Monthly Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database Status</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Server Load</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Normal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Gateway</span>
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>All Roles</option>
                  <option>Users</option>
                  <option>Owners</option>
                  <option>Admins</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.filter(u => u.role !== 'admin').map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.joinDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.role === 'owner' ? 'Manages Properties' : 'Searches PGs'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => suspendUser(user.id)}
                              className={`${user.status === 'Active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                              title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'Active' ? <UserX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Property Management</h2>
              <div className="flex space-x-4">
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>All Status</option>
                  <option>Approved</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                </select>
                <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300">
                  Review Pending ({systemStats.pendingApprovals})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockPGs.map((pg) => (
                <div key={pg.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{pg.name}</h3>
                      <p className="text-gray-600">Owner: {pg.owner}</p>
                      <div className="flex items-center text-gray-600 mt-1">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">{pg.location}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      pg.status === 'Approved' 
                        ? 'bg-green-100 text-green-700'
                        : pg.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {pg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Total Rooms</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.totalRooms}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Occupancy</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.occupancy}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.revenue}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Rating</p>
                      <p className="text-lg font-semibold text-gray-900">{pg.rating} ⭐</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors">
                      Reject
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Reports & Issues</h2>
              <div className="flex space-x-4">
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>All Types</option>
                  <option>Complaints</option>
                  <option>Bug Reports</option>
                  <option>Feature Requests</option>
                </select>
                <select className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>All Status</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            <div className="text-sm text-gray-500">{report.pg}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.type === 'Complaint' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reporter}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.priority === 'High' 
                              ? 'bg-red-100 text-red-800'
                              : report.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'Open' 
                              ? 'bg-red-100 text-red-800'
                              : report.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">Resolve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
