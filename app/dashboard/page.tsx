'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../../lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Dashboard() {
  const { user, loading: authLoading, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle URL params for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'history') {
      setActiveTab('history');
    } else if (tab === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/get-started');
    }
  }, [user, authLoading, router]);

  // If still loading or no user, show loading state
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-subtle-bg">
        <LoadingState type="spinner" message="Loading your dashboard..." />
      </div>
    );
  }
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Function to add a new generation (simulate)
  const handleAddNewGeneration = () => {
    // Create a new generation object
    const newGeneration = {
      id: `gen_${Date.now()}`,
      type: ['Talking Avatar', 'Voice Clone', 'Live Portrait'][Math.floor(Math.random() * 3)],
      name: 'New Test Generation',
      date: new Date().toISOString().split('T')[0],
      fileSize: `${(Math.random() * 20).toFixed(1)} MB`,
      status: 'processing',
      thumbnail: '/thumbnails/new-gen.jpg'
    };
    
    // Update user data with new generation
    if (user) {
      const updatedGenerations = [newGeneration, ...user.recentGenerations];
      const creditsUsed = user.credits.used + 1;
      const creditsRemaining = user.credits.total - creditsUsed;
      
      updateUser({
        recentGenerations: updatedGenerations,
        credits: {
          ...user.credits,
          used: creditsUsed,
          remaining: creditsRemaining
        }
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Handle tab change with URL update
  const handleTabChange = (tab: 'overview' | 'history' | 'settings') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab !== 'overview') {
      params.set('tab', tab);
    } else {
      params.delete('tab');
    }
    
    router.push(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600 mt-2">User ID: {user.userId}</p>
          </motion.div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex justify-center mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`relative py-4 px-4 border-b-2 font-medium text-sm mx-4 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'overview'
                ? 'border-facebook-blue text-facebook-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('history')}
            className={`relative py-4 px-4 border-b-2 font-medium text-sm mx-4 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'history'
                ? 'border-facebook-blue text-facebook-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Generation History
            {activeTab === 'history' && (
              <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`relative py-4 px-4 border-b-2 font-medium text-sm mx-4 whitespace-nowrap transition-all duration-300 ${
              activeTab === 'settings'
                ? 'border-facebook-blue text-facebook-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Account Settings
            {activeTab === 'settings' && (
              <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Subscription Info & Credit Usage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div variants={itemVariants}>
                <Card title="Current Subscription" subtitle="Your plan details">
                  <div className="mt-2">
                    <div className="inline-block bg-blue-100 text-facebook-blue text-sm font-semibold px-2.5 py-0.5 rounded-full mb-2">
                      {user.plan}
                    </div>
                    <p className="text-sm text-gray-600">Next billing: <span className="font-medium text-gray-900">{user.nextBilling}</span></p>
                    <div className="mt-4">
                      <button className="btn-secondary text-sm px-3 py-1.5">
                        Manage Subscription
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2">
                <Card title="Generation Usage" subtitle="This month's credit usage">
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Credits used: {user.credits.used}/{user.credits.total}</span>
                        <span className="text-sm font-medium text-facebook-blue">{user.credits.remaining} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-facebook-blue h-2.5 rounded-full"
                          style={{ width: `${(user.credits.used / user.credits.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>
                        <span className="block font-medium text-gray-900 mb-1">Credits reset monthly</span>
                        <span>Next reset on {user.nextBilling}</span>
                      </div>
                      <button className="btn-primary text-sm px-3 py-1.5">
                        Get More Credits
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Active Processes */}
            {user.activeProcesses.length > 0 && (
              <motion.div variants={itemVariants} className="mb-8">
                <Card title="Active Processes" subtitle="Currently running generations">
                  <div className="mt-4 space-y-4">
                    {user.activeProcesses.map((process) => (
                      <div key={process.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{process.name}</h4>
                          <span className="text-sm text-facebook-blue">{process.type}</span>
                        </div>
                        <LoadingState 
                          type="progress" 
                          message={`Generating ${process.type.toLowerCase()}`} 
                          progress={process.progress} 
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recent Generations */}
            <motion.div variants={itemVariants}>
              <Card title="Recent Generations" subtitle="Your latest creations" className="overflow-hidden">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={handleAddNewGeneration}
                    className="text-sm btn-secondary px-3 py-1.5 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Test Generation
                  </button>
                </div>
                
                {user.recentGenerations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't created any generations yet.</p>
                    <button 
                      onClick={handleAddNewGeneration}
                      className="mt-4 btn-primary"
                    >
                      Create Your First Generation
                    </button>
                  </div>
                ) : (
                  <div className="-mx-6 -mb-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.recentGenerations.slice(0, 3).map((generation) => (
                            <tr key={generation.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{generation.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.fileSize}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  generation.status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : generation.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {generation.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-facebook-blue hover:text-facebook-hover">View</button>
                                <button className="text-facebook-blue hover:text-facebook-hover ml-4">Download</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {user.recentGenerations.length > 3 && (
                      <div className="text-center bg-gray-50 py-3 border-t border-gray-200">
                        <button 
                          onClick={() => handleTabChange('history')}
                          className="text-sm text-facebook-blue hover:text-facebook-hover font-medium"
                        >
                          View All Generations
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                {user.recentGenerations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't created any generations yet.</p>
                    <button 
                      onClick={handleAddNewGeneration}
                      className="mt-4 btn-primary"
                    >
                      Create Your First Generation
                    </button>
                  </div>
                ) : (
                  <div className="-mx-6 -my-6">
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Generation History</h3>
                      <div className="flex items-center space-x-2">
                        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-facebook-blue">
                          <option value="all">All Types</option>
                          <option value="live-portrait">Live Portrait</option>
                          <option value="voice-clone">Voice Clone</option>
                          <option value="talking-avatar">Talking Avatar</option>
                        </select>
                        <button className="bg-gray-100 p-1.5 rounded-lg text-gray-500 hover:text-facebook-blue">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {user.recentGenerations.map((generation) => (
                            <tr key={generation.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{generation.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.fileSize}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  generation.status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : generation.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {generation.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-facebook-blue hover:text-facebook-hover">View</button>
                                <button className="text-facebook-blue hover:text-facebook-hover ml-4">Download</button>
                                <button className="text-red-500 hover:text-red-700 ml-4">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Showing {user.recentGenerations.length} items</span>
                      <div className="flex space-x-1">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                          Previous
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card title="Account Settings" subtitle="Manage your account details">
                <div className="mt-4 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm text-gray-600 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          id="name" 
                          defaultValue={user.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email Address</label>
                        <input 
                          type="email" 
                          id="email" 
                          defaultValue={user.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Preferences</h4>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input 
                            id="notifications-email" 
                            type="checkbox" 
                            defaultChecked
                            className="h-4 w-4 text-facebook-blue focus:ring-facebook-blue border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifications-email" className="font-medium text-gray-700">Email Notifications</label>
                          <p className="text-gray-500">Receive email updates when your generations are complete</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input 
                            id="notifications-marketing" 
                            type="checkbox" 
                            className="h-4 w-4 text-facebook-blue focus:ring-facebook-blue border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifications-marketing" className="font-medium text-gray-700">Marketing Communications</label>
                          <p className="text-gray-500">Receive updates about new features and promotions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Logout
                    </button>
                    <button className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Logout Confirmation Dialog */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 