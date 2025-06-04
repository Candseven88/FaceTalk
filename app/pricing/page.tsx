'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';
import { trackTikTokEvent } from '../components/TikTokPixel';

export default function PricingPage() {
  const { user, loading, userPlan } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const router = useRouter();

  // Track page view
  useEffect(() => {
    trackTikTokEvent('ViewContent', {
      content_type: 'product',
      content_id: 'pricing_page_001',
      content_name: 'FaceTalk Pricing Page',
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

  // Function to handle direct payment
  const handlePayment = (plan: string, url: string) => {
    // Track InitiateCheckout event
    trackTikTokEvent('InitiateCheckout', {
      content_type: 'product',
      content_id: `plan_${plan}`,
      content_name: `FaceTalk ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      value: plan === 'starter' ? 5.00 : 15.00,
      currency: 'USD'
    });
    
    // Redirect to payment URL
    window.location.href = url;
  };

  // Show content even if still loading after timeout
  const shouldShowContent = !loading || loadingTimeout;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h1>
      
      {!shouldShowContent ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">$0</span>
                  </div>
                </div>
                
                <ul className="mb-8 space-y-3">
                  {['4 Credits', 'Live Portrait', 'Voice Cloning', 'Basic Support'].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  disabled={userPlan?.plan === 'free'}
                  className={`w-full py-2 px-4 rounded-md transition duration-200 ${
                    userPlan?.plan === 'free'
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {userPlan?.plan === 'free' ? 'Current Plan' : 'Select'}
                </button>
              </div>
            </div>
            
            {/* Starter Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-blue-500 transform scale-105 z-10">
              <div className="bg-blue-600 text-white text-center py-1 px-2 text-sm">
                Most Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">$5.00</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                </div>
                
                <ul className="mb-8 space-y-3">
                  {[
                    '20 Credits Monthly',
                    'Live Portrait',
                    'Voice Cloning',
                    'Talking Avatar',
                    'Priority Support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePayment('starter', 'https://www.creem.io/payment/prod_3KM6KH3RcSxoqPMgFIIVtN')}
                  disabled={userPlan?.plan === 'starter'}
                  className={`w-full py-2 px-4 rounded-md transition duration-200 ${
                    userPlan?.plan === 'starter'
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {userPlan?.plan === 'starter' ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-purple-600 text-white text-center py-1 px-2 text-sm">
                Recommended
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                
                <div className="mt-4 mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">$15.00</span>
                    <span className="text-gray-500 ml-1">/month</span>
                  </div>
                </div>
                
                <ul className="mb-8 space-y-3">
                  {[
                    '80 Credits Monthly',
                    'All Starter Features',
                    'Higher Resolution',
                    'Commercial Use',
                    'Premium Support',
                    'Early Access to New Features'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePayment('pro', 'https://www.creem.io/payment/prod_2SWWhM45WDvaUgJzmqnV8e')}
                  disabled={userPlan?.plan === 'pro'}
                  className={`w-full py-2 px-4 rounded-md transition duration-200 ${
                    userPlan?.plan === 'pro'
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {userPlan?.plan === 'pro' ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p>All plans include the base features. Credits refresh monthly for paid plans.</p>
            <p className="mt-2">Need more credits or custom features? <a href="mailto:support@facetalk.ai" className="text-blue-500 hover:underline">Contact us</a>.</p>
          </div>
        </>
      )}
    </div>
  );
} 