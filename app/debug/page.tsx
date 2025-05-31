'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
import { db, auth } from '../../lib/firebase';

export default function DebugPage() {
  const { user, userPlan, loading } = useAuth();
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // 检查Firebase连接
    const checkFirebase = async () => {
      try {
        console.log('Firebase auth object:', auth);
        console.log('Firebase db object:', db);
        
        if (auth && db) {
          setFirebaseStatus('Firebase初始化成功');
        } else {
          setFirebaseStatus('Firebase初始化失败');
          setErrorMessage('Firebase objects are undefined');
        }
      } catch (error) {
        console.error('Firebase check error:', error);
        setFirebaseStatus('Firebase检查出错');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };
    
    checkFirebase();
  }, []);
  
  // 创建新的匿名用户
  const createNewUser = async () => {
    try {
      // 先注销当前用户
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      // 等待1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 清除localStorage
      localStorage.clear();
      
      // 刷新页面
      window.location.reload();
    } catch (error) {
      console.error('Error creating new user:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Firebase调试页面</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Firebase状态</h2>
        <p className="mb-2">状态: <span className={firebaseStatus.includes('成功') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{firebaseStatus}</span></p>
        {errorMessage && (
          <div className="p-3 bg-red-100 text-red-800 rounded mt-2">
            <p>错误: {errorMessage}</p>
          </div>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">用户信息</h2>
        {loading ? (
          <p>加载中...</p>
        ) : user ? (
          <div>
            <p className="mb-2">用户ID: <span className="font-mono bg-gray-200 p-1 rounded">{user.uid}</span></p>
            <p className="mb-2">匿名用户: {user.isAnonymous ? '是' : '否'}</p>
          </div>
        ) : (
          <p className="text-red-600">未登录</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">用户计划信息</h2>
        {loading ? (
          <p>加载中...</p>
        ) : userPlan ? (
          <div>
            <p className="mb-2">计划类型: <span className="font-semibold">{userPlan.plan}</span></p>
            <p className="mb-2">剩余点数: <span className="font-semibold">{userPlan.pointsLeft}</span></p>
            <p className="mb-2">开始时间: <span className="font-semibold">{userPlan.startDate.toDate().toLocaleString()}</span></p>
          </div>
        ) : (
          <p className="text-red-600">未找到用户计划</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">环境变量</h2>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '已设置' : '未设置'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '已设置' : '未设置'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '已设置' : '未设置'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '已设置' : '未设置'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '已设置' : '未设置'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_APP_ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '已设置' : '未设置'}</p>
      </div>
      
      <div className="flex flex-col items-start space-y-4">
        <button 
          onClick={createNewUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          创建新用户(清除当前会话)
        </button>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          返回首页
        </button>
      </div>
    </div>
  );
} 