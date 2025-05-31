'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import LoadingState from '../components/LoadingState';
import { useAuth } from '../../lib/useAuth';
import { getUserGenerations } from '../../lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';

// 本地存储键名
const LOCAL_STORAGE_GENERATIONS_KEY = 'facetalk_generations';

// 生成记录类型
interface Generation {
  id: string;
  type: string;
  result: string;
  timestamp: any;
  cost?: number;
  name?: string;
  status?: string;
  userId?: string;
  local?: boolean; // 标记是否是本地存储的生成记录
}

// 添加前端展示用的自定义User类型
interface ExtendedUser {
  uid: string;
  userId?: string;
  name?: string;
  isAnonymous?: boolean;
}

export default function Dashboard() {
  const { user, userPlan, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 创建扩展的用户对象
  const extendedUser: ExtendedUser = {
    uid: user?.uid || '',
    name: '123', // 默认用户名
    isAnonymous: true
  };
  
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
  
  // 加载生成历史
  useEffect(() => {
    const loadGenerations = async () => {
      setIsLoadingGenerations(true);
      
      try {
        // 从localStorage获取生成历史
        const localGenerations: Generation[] = [];
        try {
          const localData = localStorage.getItem(LOCAL_STORAGE_GENERATIONS_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (item && item.type && item.result && item.timestamp) {
                  localGenerations.push({
                    ...item,
                    local: true,
                    name: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Generation`,
                    status: 'completed'
                  });
                }
              });
            }
          }
        } catch (error) {
          console.error('Error loading generations from localStorage:', error);
        }
        
        // 如果有用户登录，尝试从Firebase获取生成历史
        let firebaseGenerations: Generation[] = [];
        if (user) {
          try {
            const results = await getUserGenerations(user.uid);
            firebaseGenerations = results.map((gen: any) => ({
              ...gen,
              name: `${gen.type.charAt(0).toUpperCase() + gen.type.slice(1)} Generation`,
              status: 'completed'
            }));
          } catch (error) {
            console.error('Error fetching generations from Firebase:', error);
          }
        }
        
        // 合并本地和Firebase的生成历史，按时间排序
        let allGenerations = [...localGenerations, ...firebaseGenerations];
        
        // 去重（可能有重复的记录，优先保留Firebase记录）
        const uniqueIds = new Set();
        allGenerations = allGenerations.filter(gen => {
          // 如果是本地记录且没有ID，生成一个唯一ID
          if (gen.local && !gen.id) {
            gen.id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // 如果已经存在该ID，则忽略
          if (uniqueIds.has(gen.id)) {
            return false;
          }
          
          uniqueIds.add(gen.id);
          return true;
        });
        
        // 按时间排序
        allGenerations.sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });
        
        setGenerations(allGenerations);
      } catch (error) {
        console.error('Error loading generations:', error);
      } finally {
        setIsLoadingGenerations(false);
      }
    };
    
    loadGenerations();
  }, [user]);
  
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
  
  // 格式化日期
  const formatDate = (timestamp: any): string => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // 打开生成结果
  const viewGeneration = (generation: Generation) => {
    if (generation.result) {
      window.open(generation.result, '_blank');
    }
  };
  
  // 下载生成结果
  const downloadGeneration = (generation: Generation) => {
    if (generation.result) {
      const link = document.createElement('a');
      link.href = generation.result;
      link.download = `${generation.type}-${generation.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 计算已使用的点数
  const usedPoints = userPlan?.usedPoints || 0;
  // 计算总点数
  const totalPoints = (userPlan?.pointsLeft || 0) + usedPoints;
  // 计算使用百分比
  const usagePercent = totalPoints > 0 ? (usedPoints / totalPoints) * 100 : 0;

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
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {extendedUser.name}!</h1>
            <p className="text-gray-600 mt-2">User ID: {extendedUser.uid}</p>
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
                      {userPlan?.plan || 'Free Trial'}
                    </div>
                    <p className="text-sm text-gray-600">Next billing: <span className="font-medium text-gray-900">2025-06-30</span></p>
                    <div className="mt-4">
                      <button className="btn-secondary text-sm px-3 py-1.5" onClick={() => router.push('/pricing')}>
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
                        <span className="text-sm font-medium text-gray-700">
                          Credits used: {usedPoints}/{totalPoints || 10}
                        </span>
                        <span className="text-sm font-medium text-facebook-blue">{userPlan?.pointsLeft || 10} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-facebook-blue h-2.5 rounded-full"
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>
                        <span className="block font-medium text-gray-900 mb-1">Credits reset monthly</span>
                        <span>Next reset on 2025-06-30</span>
                      </div>
                      <button className="btn-primary text-sm px-3 py-1.5" onClick={() => router.push('/pricing')}>
                        Get More Credits
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Recent Generations */}
            <motion.div variants={itemVariants}>
              <Card title="Recent Generations" subtitle="Your latest creations" className="overflow-hidden">
                <div className="flex justify-end mb-4">
                  <button 
                    onClick={() => router.push('/live-portrait')}
                    className="text-sm btn-secondary px-3 py-1.5 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Generation
                  </button>
                </div>
                
                {isLoadingGenerations ? (
                  <div className="text-center py-8">
                    <LoadingState type="spinner" message="Loading your generations..." />
                  </div>
                ) : generations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't created any generations yet.</p>
                    <button 
                      onClick={() => router.push('/live-portrait')}
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
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Storage
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {generations.slice(0, 3).map((generation) => (
                            <tr key={generation.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {generation.type.charAt(0).toUpperCase() + generation.type.slice(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatDate(generation.timestamp)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.cost || 2} points</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  generation.local
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {generation.local ? 'Local' : 'Cloud'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="text-facebook-blue hover:text-facebook-hover mr-3"
                                  onClick={() => viewGeneration(generation)}
                                >
                                  View
                                </button>
                                <button 
                                  className="text-facebook-blue hover:text-facebook-hover"
                                  onClick={() => downloadGeneration(generation)}
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {generations.length > 3 && (
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
                {isLoadingGenerations ? (
                  <div className="text-center py-8">
                    <LoadingState type="spinner" message="Loading your generations..." />
                  </div>
                ) : generations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't created any generations yet.</p>
                    <button 
                      onClick={() => router.push('/live-portrait')}
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
                          <option value="livePortrait">Live Portrait</option>
                          <option value="voiceClone">Voice Clone</option>
                          <option value="talkingPortrait">Talking Avatar</option>
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Storage
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {generations.map((generation) => (
                            <tr key={generation.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {generation.type.charAt(0).toUpperCase() + generation.type.slice(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{formatDate(generation.timestamp)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{generation.cost || 2} points</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  generation.local
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {generation.local ? 'Local' : 'Cloud'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                  className="text-facebook-blue hover:text-facebook-hover mr-3"
                                  onClick={() => viewGeneration(generation)}
                                >
                                  View
                                </button>
                                <button 
                                  className="text-facebook-blue hover:text-facebook-hover mr-3"
                                  onClick={() => downloadGeneration(generation)}
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Showing {generations.length} items</span>
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
                        <label htmlFor="name" className="block text-sm text-gray-600 mb-1">Display Name</label>
                        <input 
                          type="text" 
                          id="name" 
                          defaultValue="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                        />
                      </div>
                      <div>
                        <label htmlFor="uid" className="block text-sm text-gray-600 mb-1">User ID (cannot change)</label>
                        <input 
                          type="text" 
                          id="uid" 
                          defaultValue={extendedUser.uid}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <button className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 