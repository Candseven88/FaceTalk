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
          setFirebaseStatus('Firebase initialization successful');
        } else {
          setFirebaseStatus('Firebase initialization failed');
          setErrorMessage('Firebase objects are undefined');
        }
      } catch (error) {
        console.error('Firebase check error:', error);
        setFirebaseStatus('Firebase check error');
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
      <h1 className="text-2xl font-bold mb-6">Firebase Debug Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Firebase Status</h2>
        <p className="mb-2">Status: <span className={firebaseStatus.includes('successful') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{firebaseStatus}</span></p>
        {errorMessage && (
          <div className="p-3 bg-red-100 text-red-800 rounded mt-2">
            <p>Error: {errorMessage}</p>
          </div>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        {loading ? (
          <p>Loading...</p>
        ) : user ? (
          <div>
            <p className="mb-2">User ID: <span className="font-mono bg-gray-200 p-1 rounded">{user.uid}</span></p>
            <p className="mb-2">Anonymous User: {user.isAnonymous ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-red-600">Not logged in</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">User Plan Information</h2>
        {loading ? (
          <p>Loading...</p>
        ) : userPlan ? (
          <div>
            <p className="mb-2">Plan Type: <span className="font-semibold">{userPlan.plan}</span></p>
            <p className="mb-2">Points Left: <span className="font-semibold">{userPlan.pointsLeft}</span></p>
            <p className="mb-2">Start Date: <span className="font-semibold">{userPlan.startDate.toDate().toLocaleString()}</span></p>
          </div>
        ) : (
          <p className="text-red-600">User plan not found</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not set'}</p>
        <p className="mb-1">NEXT_PUBLIC_FIREBASE_APP_ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not set'}</p>
      </div>
      
      <div className="flex flex-col items-start space-y-4">
        <button 
          onClick={createNewUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New User (Clear Current Session)
        </button>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
} 