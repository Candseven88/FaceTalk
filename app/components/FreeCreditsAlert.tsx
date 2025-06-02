'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import { SubscriptionPlan } from '../../lib/useSubscription';
import Link from 'next/link';

export default function FreeCreditsAlert() {
  const { userPlan } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // 只对免费用户显示
  if (userPlan && userPlan.plan !== ('free' as SubscriptionPlan) || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Important:</strong> Free credits are limited to one set per device.
            Even if you clear your browser data, use incognito mode, or create a new account, 
            you won't be able to get more free credits on this device.
          </p>
          <div className="mt-2 flex space-x-4">
            <Link
              href="/pricing"
              className="text-sm font-medium text-yellow-700 underline"
            >
              View Pricing Plans
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-sm font-medium text-yellow-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 