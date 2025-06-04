'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useSubscription, SUBSCRIPTION_PLANS } from '../../lib/useSubscription';
import AuthForms from '../components/AuthForms';
import Link from 'next/link';
import { trackPageView, trackViewContent } from '../utils/analytics';

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const { 
    getCurrentPlan,
    subscribeToPlan,
    hasActiveSubscription,
    getPaymentLink,
    processing,
    error,
    successMessage
  } = useSubscription();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [authSuccessRedirectTimer, setAuthSuccessRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  
  const currentPlan = getCurrentPlan();
  const isSubscribed = hasActiveSubscription();
  
  // Track page view when component mounts
  useEffect(() => {
    // Track regular page view
    trackPageView('Pricing');
    
    // Track detailed ViewContent event
    trackViewContent({
      content_type: 'product_list',
      content_id: 'pricing_plans',
      content_name: 'Subscription Plans'
    });
  }, []);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (authSuccessRedirectTimer) {
        clearTimeout(authSuccessRedirectTimer);
      }
    };
  }, [authSuccessRedirectTimer]);

  // Handle subscription button click
  const handleSubscribeClick = (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    setLocalError(null);
    
    // Prevent multiple clicks
    if (isProcessingPayment) return;
    
    // If user is not logged in, show login/register modal
    if (!user) {
      console.log('User not logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }
    
    // Show processing state
    setIsProcessingPayment(true);
    
    // Process payment directly
    try {
      console.log('User is logged in, getting payment link for plan:', plan);
      const paymentLink = getPaymentLink(plan);
      console.log('Payment link generated:', paymentLink);
      
      // Add delay to ensure UI state updates correctly
      setTimeout(() => {
        // Use window.location.href for redirect
        window.location.href = paymentLink;
      }, 300);
    } catch (err) {
      console.error('Error getting payment link:', err);
      setLocalError('Unable to generate payment link. Please try again later.');
      setIsProcessingPayment(false);
    }
  };
  
  // Auth success callback
  const handleAuthSuccess = () => {
    console.log('Auth success, user logged in');
    setShowAuthModal(false);
    
    // After successful auth, redirect to payment page if plan was selected
    if (selectedPlan) {
      setIsProcessingPayment(true);
      
      try {
        console.log('Getting payment link for plan after auth:', selectedPlan);
        const paymentLink = getPaymentLink(selectedPlan);
        console.log('Payment link generated after auth:', paymentLink);
        
        // Use a small timeout to ensure the auth state is fully updated
        const timer = setTimeout(() => {
          window.location.href = paymentLink;
        }, 1000);
        
        setAuthSuccessRedirectTimer(timer);
      } catch (err) {
        console.error('Error getting payment link after auth:', err);
        setLocalError('Login successful but unable to generate payment link. Please try again.');
        setIsProcessingPayment(false);
      }
    }
  };
  
  // If user is currently being authenticated, show loading state
  if (authLoading) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
            <div className="flex justify-center my-8">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All plans include access to our core features. Select the best option for your needs.
            {user && <span className="ml-2 text-blue-600">You're logged in and ready to subscribe!</span>}
          </p>
        </div>
        
        {/* Error and success messages */}
        {(error || localError) && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md max-w-2xl mx-auto">
            {error || localError}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md max-w-2xl mx-auto">
            {successMessage}
          </div>
        )}
        
        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free Trial</h3>
              
              <div className="mt-4 mb-6">
                <p className="text-3xl font-bold text-gray-900">Free</p>
                <p className="text-gray-600 mt-1">Limited to one free trial per device</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">3 Credits</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Refreshes monthly</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, 'Live Portrait (2 credits)')}
                {renderFeatureItem(true, 'Voice Clone (1 credit)')}
                {renderFeatureItem(false, 'Talking Avatar (4 credits)')}
              </ul>
              
              <button
                disabled={currentPlan === 'free'}
                className={`w-full py-2 px-4 ${
                  currentPlan === 'free' 
                    ? 'bg-blue-100 text-blue-800 cursor-default' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } rounded-md`}
              >
                {currentPlan === 'free' ? 'Current Plan' : 'Start Free'}
              </button>
            </div>
          </div>
          
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform scale-105 z-10">
            <div className="bg-blue-600 text-white text-center py-1 px-2 text-sm">
              🟢 Best Value
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Starter Plan</h3>
              
              <div className="mt-4 mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">$5</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mt-1">10 credits monthly, all features unlocked</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">10 Credits</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Refreshes monthly</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, 'Live Portrait (2 credits)')}
                {renderFeatureItem(true, 'Voice Clone (1 credit)')}
                {renderFeatureItem(true, 'Talking Avatar (4 credits)')}
                {renderFeatureItem(true, 'Priority Processing')}
                {renderFeatureItem(true, '30 Days Result Storage')}
              </ul>
              
              <button
                onClick={() => handleSubscribeClick('basic')}
                disabled={isProcessingPayment || currentPlan === 'basic'}
                className={`w-full py-2 px-4 ${
                  isProcessingPayment 
                    ? 'bg-blue-300 cursor-wait' 
                    : currentPlan === 'basic'
                      ? 'bg-blue-100 text-blue-800 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                } rounded-md relative overflow-hidden`}
              >
                {isProcessingPayment && selectedPlan === 'basic' ? (
                  <>
                    <span className="opacity-0">Subscribe $5/mo</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : currentPlan === 'basic' ? 'Current Plan' : 'Subscribe $5/mo'}
              </button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-purple-600 text-white text-center py-1 px-2 text-sm">
              🟣 Recommended
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Pro Plan</h3>
              
              <div className="mt-4 mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">$15</span>
                  <span className="text-gray-500 ml-1">/month</span>
                </div>
                <p className="text-gray-600 mt-1">40 credits monthly, all features unlocked, priority support</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">40 Credits</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Refreshes monthly</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, 'Live Portrait (2 credits)')}
                {renderFeatureItem(true, 'Voice Clone (1 credit)')}
                {renderFeatureItem(true, 'Talking Avatar (4 credits)')}
                {renderFeatureItem(true, 'Priority Processing')}
                {renderFeatureItem(true, '90 Days Result Storage')}
              </ul>
              
              <button
                onClick={() => handleSubscribeClick('pro')}
                disabled={isProcessingPayment || currentPlan === 'pro'}
                className={`w-full py-2 px-4 ${
                  isProcessingPayment 
                    ? 'bg-blue-300 cursor-wait' 
                    : currentPlan === 'pro'
                      ? 'bg-blue-100 text-blue-800 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                } rounded-md relative overflow-hidden`}
              >
                {isProcessingPayment && selectedPlan === 'pro' ? (
                  <>
                    <span className="opacity-0">Subscribe $15/mo</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : currentPlan === 'pro' ? 'Current Plan' : 'Subscribe $15/mo'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Auth modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-2 absolute right-0 top-0">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="pt-8">
                <AuthForms initialView="login" onSuccess={handleAuthSuccess} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Helper function to render feature items
  function renderFeatureItem(included: boolean, text: string) {
    return (
      <li className="flex items-center">
        <svg className={`h-5 w-5 ${included ? 'text-green-500' : 'text-gray-400'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={included ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
        </svg>
        <span className={included ? 'text-gray-700' : 'text-gray-400'}>
          {text}
        </span>
      </li>
    );
  }
} 