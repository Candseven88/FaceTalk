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
    
    // 防止重复点击
    if (isProcessingPayment) return;
    
    // If user is not logged in, show login/register modal
    if (!user) {
      console.log('User not logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }
    
    // 显示处理中状态
    setIsProcessingPayment(true);
    
    // 直接处理支付
    try {
      console.log('User is logged in, getting payment link for plan:', plan);
      const paymentLink = getPaymentLink(plan);
      console.log('Payment link generated:', paymentLink);
      
      // 添加延迟以确保UI状态正确更新
      setTimeout(() => {
        // 使用window.location.href进行重定向
        window.location.href = paymentLink;
      }, 300);
    } catch (err) {
      console.error('Error getting payment link:', err);
      setLocalError('无法生成支付链接，请稍后再试。');
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
        setLocalError('登录成功但无法生成支付链接，请稍后再试。');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">正在加载...</h1>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">选择适合您的计划</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            所有计划都包含核心功能访问权限，选择最适合您需求的方案。
            {user && <span className="ml-2 text-blue-600">您已登录，可以直接订阅！</span>}
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
              <h3 className="text-xl font-bold text-gray-900 mb-1">免费试用</h3>
              
              <div className="mt-4 mb-6">
                <p className="text-3xl font-bold text-gray-900">免费</p>
                <p className="text-gray-600 mt-1">每台设备限一次免费试用</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">3 积分</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">每月刷新</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, '人像生成 (2积分)')}
                {renderFeatureItem(true, '语音克隆 (1积分)')}
                {renderFeatureItem(false, '会说话的头像 (4积分)')}
              </ul>
              
              <button
                disabled={currentPlan === 'free'}
                className={`w-full py-2 px-4 ${
                  currentPlan === 'free' 
                    ? 'bg-blue-100 text-blue-800 cursor-default' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } rounded-md`}
              >
                {currentPlan === 'free' ? '当前方案' : '免费开始'}
              </button>
            </div>
          </div>
          
          {/* Basic Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transform scale-105 z-10">
            <div className="bg-blue-600 text-white text-center py-1 px-2 text-sm">
              🟢 最佳性价比
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">入门方案</h3>
              
              <div className="mt-4 mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">$5</span>
                  <span className="text-gray-500 ml-1">/月</span>
                </div>
                <p className="text-gray-600 mt-1">每月10积分，全部功能解锁</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">10 积分</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">每月刷新</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, '人像生成 (2积分)')}
                {renderFeatureItem(true, '语音克隆 (1积分)')}
                {renderFeatureItem(true, '会说话的头像 (4积分)')}
                {renderFeatureItem(true, '优先处理')}
                {renderFeatureItem(true, '30天结果存储')}
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
                    <span className="opacity-0">订阅 $5/月</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : currentPlan === 'basic' ? '当前方案' : '订阅 $5/月'}
              </button>
            </div>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="bg-purple-600 text-white text-center py-1 px-2 text-sm">
              🟣 推荐方案
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">专业方案</h3>
              
              <div className="mt-4 mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">$15</span>
                  <span className="text-gray-500 ml-1">/月</span>
                </div>
                <p className="text-gray-600 mt-1">每月40积分，全部功能解锁，优先支持</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">40 积分</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">每月刷新</p>
              </div>
              
              <ul className="mb-6 space-y-3">
                {renderFeatureItem(true, '人像生成 (2积分)')}
                {renderFeatureItem(true, '语音克隆 (1积分)')}
                {renderFeatureItem(true, '会说话的头像 (4积分)')}
                {renderFeatureItem(true, '优先处理')}
                {renderFeatureItem(true, '90天结果存储')}
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
                    <span className="opacity-0">订阅 $15/月</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </>
                ) : currentPlan === 'pro' ? '当前方案' : '订阅 $15/月'}
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