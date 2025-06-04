'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { useSubscription, SUBSCRIPTION_PLANS } from '../../lib/useSubscription';
import AuthForms from '../components/AuthForms';
import Link from 'next/link';
import { trackPageView, trackViewContent } from '../utils/analytics';
import PaymentOptions from '../components/PaymentOptions';
import PricingCard from '../components/PricingCard';
import { trackTikTokEvent } from '../components/TikTokPixel';

export default function PricingPage() {
  const { user, loading, userPlan, updateUserPlan } = useAuth();
  const { 
    getCurrentPlan,
    subscribeToPlan,
    hasActiveSubscription,
    getPaymentLink,
    processing: subscriptionProcessing,
    error,
    successMessage
  } = useSubscription();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [authSuccessRedirectTimer, setAuthSuccessRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const router = useRouter();
  
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

  // Add a useEffect to initialize local state immediately
  useEffect(() => {
    // Force loading state to false after a timeout to prevent indefinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log('Auth still loading after timeout, showing page anyway');
        setLoadingTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(loadingTimeout);
  }, []);

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
  
  const handlePaymentSuccess = async (plan: 'free' | 'starter' | 'pro', points: number) => {
    setIsProcessingPayment(true);
    
    try {
      console.log(`Payment successful for ${plan} plan with ${points} points`);
      
      // Track successful purchase
      trackTikTokEvent('CompletePayment', {
        value: plan === 'starter' ? 4.99 : 19.99,
        currency: 'USD',
        content_type: 'product',
        content_id: `plan_${plan}`,
        content_name: `FaceTalk ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        quantity: 1
      });
      
      if (user?.uid) {
        await updateUserPlan(user.uid, plan, points);
        console.log('User plan updated successfully');
        router.push('/dashboard');
      } else {
        console.error('Cannot update user plan: User ID is missing');
        alert('There was a problem updating your account. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Error during payment processing:', error);
      alert('Payment was successful, but there was an error updating your account. Please contact support.');
    } finally {
      setIsProcessingPayment(false);
    }
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
            <PricingCard
              title="Free"
              price="$0"
              features={[
                "4 Credits",
                "Live Portrait",
                "Voice Cloning",
                "Basic Support"
              ]}
              isCurrent={userPlan?.plan === 'free'}
              onSelect={() => {
                if (userPlan?.plan !== 'free') {
                  handlePaymentSuccess('free', 4);
                }
              }}
              buttonText={userPlan?.plan === 'free' ? 'Current Plan' : 'Select'}
              disabled={subscriptionProcessing || userPlan?.plan === 'free'}
            />
            
            {/* Starter Plan */}
            <PricingCard
              title="Starter"
              price="$4.99"
              period="month"
              features={[
                "20 Credits Monthly",
                "Live Portrait",
                "Voice Cloning",
                "Talking Avatar",
                "Priority Support"
              ]}
              popular={true}
              isCurrent={userPlan?.plan === 'starter'}
              buttonText={userPlan?.plan === 'starter' ? 'Current Plan' : 'Subscribe'}
              onSelect={() => {
                if (userPlan?.plan !== 'starter') {
                  // Show payment options
                  document.getElementById('payment-modal-starter')?.classList.remove('hidden');
                }
              }}
              disabled={subscriptionProcessing || userPlan?.plan === 'starter'}
            />
            
            {/* Pro Plan */}
            <PricingCard
              title="Pro"
              price="$19.99"
              period="month"
              features={[
                "80 Credits Monthly",
                "All Starter Features",
                "Higher Resolution",
                "Commercial Use",
                "Premium Support",
                "Early Access to New Features"
              ]}
              isCurrent={userPlan?.plan === 'pro'}
              buttonText={userPlan?.plan === 'pro' ? 'Current Plan' : 'Subscribe'}
              onSelect={() => {
                if (userPlan?.plan !== 'pro') {
                  // Show payment options
                  document.getElementById('payment-modal-pro')?.classList.remove('hidden');
                }
              }}
              disabled={subscriptionProcessing || userPlan?.plan === 'pro'}
            />
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p>All plans include the base features. Credits refresh monthly for paid plans.</p>
            <p className="mt-2">Need more credits or custom features? <a href="mailto:support@facetalk.ai" className="text-blue-500 hover:underline">Contact us</a>.</p>
          </div>
          
          {/* Payment Modal for Starter Plan */}
          <PaymentOptions
            id="payment-modal-starter"
            plan="starter"
            price={4.99}
            credits={20}
            onSuccess={() => handlePaymentSuccess('starter', 20)}
          />
          
          {/* Payment Modal for Pro Plan */}
          <PaymentOptions
            id="payment-modal-pro"
            plan="pro"
            price={19.99}
            credits={80}
            onSuccess={() => handlePaymentSuccess('pro', 80)}
          />
        </>
      )}
    </div>
  );
} 