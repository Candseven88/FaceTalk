'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/useAuth';
import { trackPurchase } from '../utils/analytics';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUserPlan } = useAuth();
  const [isUpdating, setIsUpdating] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        setIsUpdating(true);
        
        // Get plan parameter from URL
        const plan = searchParams.get('plan');
        
        if (!plan || !user) {
          setError('Missing plan information or user is not authenticated');
          setIsUpdating(false);
          return;
        }
        
        // Validate plan type
        if (plan !== 'starter' && plan !== 'pro') {
          setError('Invalid plan type');
          setIsUpdating(false);
          return;
        }
        
        // Set points based on plan
        const points = plan === 'starter' ? 20 : 80;
        const planPrice = plan === 'starter' ? 9.99 : 29.99;
        
        // Update user plan in Firestore
        await updateUserPlan(user.uid, plan, points);
        
        // Track purchase event with TikTok Pixel
        trackPurchase({
          value: planPrice,
          currency: 'USD',
          content_type: 'product',
          content_id: `facetalk_${plan}_plan`,
          content_name: `FaceTalk ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
          quantity: 1
        });
        
        setSuccess(true);
        setIsUpdating(false);
        
        // Redirect to pricing page after 3 seconds
        setTimeout(() => {
          router.push('/pricing');
        }, 3000);
      } catch (err) {
        console.error('Error updating plan:', err);
        setError('Failed to update your plan. Please contact support.');
        setIsUpdating(false);
      }
    };

    if (user) {
      handlePaymentSuccess();
    }
  }, [user, searchParams, router, updateUserPlan]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {isUpdating ? (
              <>
                <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h2 className="text-2xl font-bold text-gray-900">Processing payment...</h2>
                <p className="mt-2 text-gray-600">Please wait while we update your subscription.</p>
              </>
            ) : success ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment successful!</h2>
                <p className="mt-2 text-gray-600">Your subscription has been updated successfully.</p>
                <p className="mt-2 text-gray-600">Redirecting to the pricing page...</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                <p className="mt-2 text-gray-600">{error || 'An error occurred during payment processing.'}</p>
              </>
            )}

            <div className="mt-6">
              <Link href="/pricing" className="font-medium text-indigo-600 hover:text-indigo-500">
                Return to Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 