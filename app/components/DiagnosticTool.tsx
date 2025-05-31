'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';

/**
 * 诊断工具组件，显示用户身份和积分信息
 * 用于帮助开发者和用户调试问题
 */
export default function DiagnosticTool() {
  const { user, userPlan, loading } = useAuth();
  const [localData, setLocalData] = useState<Record<string, any>>({});
  const [showDetails, setShowDetails] = useState(false);

  // 从localStorage收集信息
  useEffect(() => {
    const data: Record<string, any> = {};
    
    // 关键存储项列表
    const keysToCheck = [
      'facetalk_user_uid',
      'facetalk_points',
      'facetalk_last_used',
      'facetalk_last_generation',
      'facetalk_generations',
      'facetalk_active_tasks',
      'facetalk_username'
    ];
    
    // 收集所有相关的本地存储数据
    keysToCheck.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      } else {
        data[key] = null;
      }
    });
    
    setLocalData(data);
  }, []);

  // 清除本地存储和刷新页面
  const handleReset = () => {
    if (confirm('这将清除所有本地存储的数据并刷新页面。继续吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-md mb-6">
        <p className="text-blue-800">正在加载用户数据...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-md p-4 mb-6 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">系统诊断工具</h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? '隐藏详情' : '显示详情'}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="font-medium">用户ID:</div>
          <div>{user?.uid || '未登录'}</div>
          
          <div className="font-medium">登录状态:</div>
          <div>{user ? (user.isAnonymous ? '匿名用户' : '已登录用户') : '未登录'}</div>
          
          <div className="font-medium">会员等级:</div>
          <div>{userPlan?.plan || '无数据'}</div>
          
          <div className="font-medium">剩余积分:</div>
          <div>{userPlan?.pointsLeft || localData.facetalk_points || '无数据'}</div>
        </div>
      </div>
      
      {showDetails && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-md font-medium mb-2">详细信息</h4>
          <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-60 text-xs">
            <pre>{JSON.stringify({ user: user ? { uid: user.uid, isAnonymous: user.isAnonymous } : null, userPlan, localStorage: localData }, null, 2)}</pre>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleReset}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              重置所有数据
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 