'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useDeviceId } from '../../lib/useDeviceId';
import { usePoints } from '../../lib/usePoints';
import { SubscriptionPlan } from '../../lib/useSubscription';
import Link from 'next/link';

export default function CreditsInfo() {
  const { user, userPlan } = useAuth();
  const { deviceId, isLoading: deviceLoading } = useDeviceId();
  const { getRemainingPoints } = usePoints();
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  useEffect(() => {
    const credits = getRemainingPoints();
    setRemainingCredits(credits);
  }, [userPlan, getRemainingPoints]);

  const truncateDeviceId = (id: string | null) => {
    if (!id) return 'Unknown';
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  const getPlanBadgeColor = () => {
    if (!userPlan) return 'bg-gray-100 text-gray-800';
    
    switch (userPlan.plan) {
      case 'basic' as SubscriptionPlan:
        return 'bg-blue-100 text-blue-800';
      case 'pro' as SubscriptionPlan:
        return 'bg-purple-100 text-purple-800';
      case 'enterprise' as SubscriptionPlan:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">Credits:</span>
            <span className="text-xl font-bold text-blue-600">
              {remainingCredits !== null ? remainingCredits : '...'}
            </span>
            {userPlan && (
              <span className={`text-xs px-2 py-1 rounded-full ${getPlanBadgeColor()}`}>
                {userPlan.plan.charAt(0).toUpperCase() + userPlan.plan.slice(1)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {userPlan && userPlan.plan !== 'free' 
              ? 'Subscription renews monthly'
              : 'Free credits are limited to one per device'}
          </p>
        </div>
        
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Get More
        </Link>
      </div>
      
      {/* Device Info Section (expandable) */}
      <div className="mt-3 border-t pt-2">
        <button 
          onClick={() => setShowDeviceInfo(!showDeviceInfo)}
          className="text-sm text-gray-500 flex items-center"
        >
          <span>Device Info</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${showDeviceInfo ? 'transform rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDeviceInfo && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <p>Device ID: {deviceLoading ? 'Loading...' : truncateDeviceId(deviceId)}</p>
            <p className="mt-1">
              This unique device identifier helps us prevent abuse of free credits. 
              Each physical device can only claim free credits once.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 