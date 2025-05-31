'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import { useSubscription, SUBSCRIPTION_PLANS } from '../../lib/useSubscription';
import AuthForms from '../components/AuthForms';
import Link from 'next/link';

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
  
  const currentPlan = getCurrentPlan();
  const isSubscribed = hasActiveSubscription();
  
  // 处理订阅按钮点击
  const handleSubscribeClick = (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    
    // 如果用户未登录，显示登录/注册模态框
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // 否则直接重定向到支付页面
    window.location.href = getPaymentLink(plan);
  };
  
  // 用户认证成功的回调
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    
    // 认证成功后，如果有选择的计划，重定向到相应的支付页面
    if (selectedPlan) {
      window.location.href = getPaymentLink(selectedPlan);
    }
  };
  
  // 渲染计划卡片
  const renderPlanCard = (planKey: 'free' | 'basic' | 'pro') => {
    const plan = SUBSCRIPTION_PLANS[planKey];
    const isCurrentPlan = currentPlan === planKey;
    const isFree = planKey === 'free';
    
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden border ${
        isCurrentPlan ? 'border-blue-500' : 'border-gray-200'
      }`}>
        {/* 计划标签 */}
        {plan.tag && (
          <div className="bg-blue-600 text-white text-center py-1 px-2 text-sm">
            {plan.tag}
          </div>
        )}
        
        {/* 计划标题 */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
          
          {/* 价格 */}
          <div className="mt-4 mb-6">
            {isFree ? (
              <p className="text-3xl font-bold text-gray-900">Free</p>
            ) : (
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
            )}
            <p className="text-gray-600 mt-1">{plan.description}</p>
          </div>
          
          {/* 积分 */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-medium text-gray-900">{plan.credits} Credits</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Refreshes monthly</p>
          </div>
          
          {/* 特性列表 */}
          <ul className="mb-6 space-y-3">
            <li className="flex items-center">
              <svg className={`h-5 w-5 ${plan.features.livePortrait ? 'text-green-500' : 'text-gray-400'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={plan.features.livePortrait ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
              <span className={plan.features.livePortrait ? 'text-gray-700' : 'text-gray-400'}>
                Live Portrait (2 credits)
              </span>
            </li>
            <li className="flex items-center">
              <svg className={`h-5 w-5 ${plan.features.voiceCloning ? 'text-green-500' : 'text-gray-400'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={plan.features.voiceCloning ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
              <span className={plan.features.voiceCloning ? 'text-gray-700' : 'text-gray-400'}>
                Voice Clone (1 credit)
              </span>
            </li>
            <li className="flex items-center">
              <svg className={`h-5 w-5 ${plan.features.talkingAvatar ? 'text-green-500' : 'text-gray-400'} mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={plan.features.talkingAvatar ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
              </svg>
              <span className={plan.features.talkingAvatar ? 'text-gray-700' : 'text-gray-400'}>
                Talking Avatar (4 credits)
              </span>
            </li>
            {!isFree && (
              <>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">
                    Priority Processing
                  </span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">
                    {planKey === 'pro' ? '90 Days' : '30 Days'} Result Storage
                  </span>
                </li>
              </>
            )}
          </ul>
          
          {/* 操作按钮 */}
          {isCurrentPlan ? (
            <button
              disabled
              className="w-full py-2 px-4 bg-blue-100 text-blue-800 rounded-md cursor-default"
            >
              Current Plan
            </button>
          ) : isFree ? (
            <Link 
              href="/" 
              className="w-full block text-center py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Start Free
            </Link>
          ) : (
            <button
              onClick={() => handleSubscribeClick(planKey)}
              disabled={processing}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Subscribe $${plan.price}/mo`}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the perfect plan for your needs. All plans include access to our core features.
          </p>
        </div>
        
        {/* 错误和成功消息 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md max-w-2xl mx-auto">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md max-w-2xl mx-auto">
            {successMessage}
          </div>
        )}
        
        {/* 计划卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {renderPlanCard('free')}
          {renderPlanCard('basic')}
          {renderPlanCard('pro')}
        </div>
        
        {/* 计划比较 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Plan Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-gray-600">Feature</th>
                  <th className="py-3 px-4 text-center text-gray-600">Free</th>
                  <th className="py-3 px-4 text-center text-gray-600">Basic</th>
                  <th className="py-3 px-4 text-center text-gray-600">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Monthly Credits</td>
                  <td className="py-3 px-4 text-center text-gray-800">3</td>
                  <td className="py-3 px-4 text-center text-gray-800">10</td>
                  <td className="py-3 px-4 text-center text-gray-800">40</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Live Portrait</td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Voice Clone</td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Talking Avatar</td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="h-5 w-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Results Storage</td>
                  <td className="py-3 px-4 text-center text-gray-800">24 Hours</td>
                  <td className="py-3 px-4 text-center text-gray-800">30 Days</td>
                  <td className="py-3 px-4 text-center text-gray-800">90 Days</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-800 font-medium">Support</td>
                  <td className="py-3 px-4 text-center text-gray-800">Community</td>
                  <td className="py-3 px-4 text-center text-gray-800">Email</td>
                  <td className="py-3 px-4 text-center text-gray-800">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How do credits work?</h3>
              <p className="text-gray-600">
                Credits are used each time you generate content. Live Portrait costs 2 credits, 
                Voice Clone costs 1 credit, and Talking Avatar costs 4 credits. Credits refresh 
                monthly on your billing date.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your subscription will remain active 
                until the end of your current billing cycle, and you'll still have access to your credits 
                during that time.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How long are my results stored?</h3>
              <p className="text-gray-600">
                Free users can access their results for 24 hours. Basic subscribers have access for 30 days, 
                and Pro subscribers for 90 days. You can always download your results to keep them permanently.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">What happens if I run out of credits?</h3>
              <p className="text-gray-600">
                If you run out of credits, you'll need to wait until your next billing cycle when your credits 
                refresh. We're considering adding the option to purchase additional credits in the future.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 登录/注册模态框 */}
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
  );
} 