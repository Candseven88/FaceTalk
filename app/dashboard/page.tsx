'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { getUserGenerations } from '@/lib/firebase';
import Link from 'next/link';
import { trackTikTokEvent } from '../components/TikTokPixel';

export default function DashboardPage() {
  const { user, loading, userPlan } = useAuth();
  const [generations, setGenerations] = useState<any[]>([]);
  const [generationsLoading, setGenerationsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Track page view
  useEffect(() => {
    trackTikTokEvent('ViewContent', {
      content_type: 'product',
      content_id: 'dashboard_page_001',
      content_name: 'FaceTalk Dashboard Page',
      value: 0.00,
      currency: 'USD'
    });
  }, []);

  // Set timeout for loading state to avoid infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('Auth still loading after timeout, showing page anyway');
        setLoadingTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Load user generations
  useEffect(() => {
    const loadGenerations = async () => {
      if (!user && !loadingTimeout) {
        // Force loading to false after 5 seconds to prevent infinite loading
        const timer = setTimeout(() => {
          console.log('Dashboard still loading after timeout, forcing render');
          setGenerationsLoading(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      
      try {
        setGenerationsLoading(true);
        
        if (user) {
          const userGenerations = await getUserGenerations(user.uid, 10);
          console.log('Loaded generations:', userGenerations.length);
          setGenerations(userGenerations);
        } else {
          // If we reach this point after timeout but no user, show empty state
          setGenerations([]);
        }
      } catch (error) {
        console.error('Error loading generations:', error);
        setGenerations([]);
      } finally {
        setGenerationsLoading(false);
      }
    };

    loadGenerations();
  }, [user, loadingTimeout]);

  // Show content even if still loading after timeout
  const shouldShowContent = !loading || loadingTimeout;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {!shouldShowContent ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium text-gray-700">Plan: </span>
                <span className="capitalize">{userPlan?.plan || 'Free'}</span>
              </p>
              <p>
                <span className="font-medium text-gray-700">Credits: </span>
                {userPlan?.pointsLeft || 0} points left
              </p>
              {userPlan?.plan !== 'free' && (
                <p className="text-sm text-gray-500">
                  Credits refresh monthly on your subscription date.
                </p>
              )}
              {userPlan?.plan === 'free' && (
                <div className="mt-4">
                  <Link 
                    href="/pricing" 
                    className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Upgrade Plan
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Features Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link 
                href="/live-portrait" 
                className="bg-blue-50 border border-blue-100 p-4 rounded-lg hover:bg-blue-100 transition"
              >
                <h3 className="font-medium text-blue-800 mb-2">Live Portrait</h3>
                <p className="text-sm text-gray-600">Create a real-time animated portrait from your photo.</p>
                <p className="text-xs text-gray-500 mt-2">2 credits per generation</p>
              </Link>
              
              <Link 
                href="/voice-clone" 
                className="bg-green-50 border border-green-100 p-4 rounded-lg hover:bg-green-100 transition"
              >
                <h3 className="font-medium text-green-800 mb-2">Voice Clone</h3>
                <p className="text-sm text-gray-600">Clone your voice with just a short audio sample.</p>
                <p className="text-xs text-gray-500 mt-2">1 credit per generation</p>
              </Link>
              
              <Link 
                href="/talking-avatar" 
                className="bg-purple-50 border border-purple-100 p-4 rounded-lg hover:bg-purple-100 transition"
              >
                <h3 className="font-medium text-purple-800 mb-2">Talking Avatar</h3>
                <p className="text-sm text-gray-600">Make your portrait talk with your cloned voice.</p>
                <p className="text-xs text-gray-500 mt-2">4 credits per generation</p>
              </Link>
            </div>
          </div>
          
          {/* Recent Generations Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Recent Generations</h2>
            {generationsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : generations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {generations.map((gen) => (
                  <div key={gen.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium capitalize">{gen.type}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(gen.timestamp?.toDate?.() || gen.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {gen.cost || 0} credits
                      </span>
                    </div>
                    {gen.result && (
                      <div className="mt-2 text-sm">
                        <p className="truncate">{gen.result}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No generations yet. Try creating one!</p>
                <div className="mt-4">
                  <Link 
                    href="/live-portrait" 
                    className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Create Your First Generation
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 