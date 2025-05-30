'use client';

import { useAuth } from '../../lib/useAuth';
import Link from 'next/link';

export default function PlanInfoBar() {
  const { user, userPlan } = useAuth();

  if (!userPlan) {
    return null; // Don't show anything while loading
  }

  // Get the UID or display "Not Logged In" if no user
  const uidDisplay = user ? user.uid : 'Not Logged In';

  return (
    <div className="bg-gray-800 text-white py-2 px-4 text-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <div>
            <span className="font-semibold">Plan:</span>{' '}
            <span className="capitalize">{userPlan.plan}</span>
          </div>
          <div>
            <span className="font-semibold">Points:</span>{' '}
            <span>{userPlan.pointsLeft}</span>
          </div>
          <div>
            <span className="font-semibold">UID:</span>{' '}
            <span className="text-xs font-mono">{uidDisplay}</span>
          </div>
        </div>
        <Link 
          href="/pricing" 
          className="text-xs bg-indigo-600 hover:bg-indigo-700 px-2 py-1 rounded"
        >
          {userPlan.plan === 'free' ? 'Upgrade' : 'Manage Plan'}
        </Link>
      </div>
    </div>
  );
} 