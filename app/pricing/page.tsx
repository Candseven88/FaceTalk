'use client';

import { useAuth } from '../../lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PricingPage() {
  const { user, userPlan, updateUserPlan } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user came from payment success page and has query parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const plan = urlParams.get('plan');
      const success = urlParams.get('success');

      if (user && plan && success === 'true') {
        // Update user plan after successful payment
        const points = plan === 'starter' ? 20 : 80;
        updateUserPlan(user.uid, plan as any, points);
        
        // Clear the URL parameters after processing
        router.push('/pricing');
      }
    }
  }, [user, router, updateUserPlan]);

  const planFeatures = {
    free: [
      '3 free uses (lifetime)',
      'Live Portrait Animation',
      'Voice Cloning',
      'Basic support'
    ],
    starter: [
      '20 points monthly',
      'All Free features',
      'Higher quality results',
      'Priority support'
    ],
    pro: [
      '80 points monthly',
      'All Starter features',
      'Highest quality results',
      'Premium support',
      'Early access to new features'
    ]
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose the Right Plan for You
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            All plans include access to our AI features with different usage limits
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">Get started with basic features</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/lifetime</span>
              </p>
              <div className="mt-8">
                <div className="rounded-md shadow">
                  <button 
                    className={`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${userPlan?.plan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={userPlan?.plan === 'free'}
                  >
                    {userPlan?.plan === 'free' ? 'Current Plan' : 'Get Started'}
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features included:</h4>
              <ul className="mt-6 space-y-4">
                {planFeatures.free.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Starter Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Starter</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for occasional use</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$5</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <div className="mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="https://www.creem.io/payment/prod_3KM6KH3RcSxoqPMgFIIVtN"
                    className={`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${userPlan?.plan === 'starter' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (userPlan?.plan === 'starter') {
                        return;
                      }
                    }}
                  >
                    {userPlan?.plan === 'starter' ? 'Current Plan' : 'Subscribe'}
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features included:</h4>
              <ul className="mt-6 space-y-4">
                {planFeatures.starter.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">For power users and professionals</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$15</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <div className="mt-8">
                <div className="rounded-md shadow">
                  <a
                    href="https://www.creem.io/payment/prod_2SWWhM45WDvaUgJzmqnV8e"
                    className={`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${userPlan?.plan === 'pro' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (userPlan?.plan === 'pro') {
                        return;
                      }
                    }}
                  >
                    {userPlan?.plan === 'pro' ? 'Current Plan' : 'Subscribe'}
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">Features included:</h4>
              <ul className="mt-6 space-y-4">
                {planFeatures.pro.map((feature, index) => (
                  <li key={index} className="flex">
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-gray-500">
            Current plan: <span className="font-bold capitalize">{userPlan?.plan || 'Loading...'}</span> | 
            Points remaining: <span className="font-bold">{userPlan?.pointsLeft || 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
} 