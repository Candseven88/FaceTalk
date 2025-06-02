'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc, setDoc, updateDoc, Timestamp, db, processSubscription } from './firebase';
import { UserPlanData } from './useAuth';

// 扩展UserPlanData类型以包含订阅相关字段
interface ExtendedUserPlanData extends UserPlanData {
  subscriptionActive?: boolean;
  subscriptionCancelled?: Timestamp;
}

// 定义订阅计划类型
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

// 订阅计划详情
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Trial',
    price: 0,
    credits: 3,
    features: {
      livePortrait: true,
      voiceCloning: true,
      talkingAvatar: false
    },
    description: '尝试基本功能，每台设备仅限一次免费额度',
    tag: '🔍 Try Now'
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    credits: 15,
    features: {
      livePortrait: true,
      voiceCloning: true,
      talkingAvatar: true
    },
    description: '每月15个credits，所有功能解锁',
    tag: '🟢 Best Value',
    paymentLink: 'https://www.creem.io/payment/prod_FDwwEsjdqfy6bQ6MZ4T0p'
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    credits: 50,
    features: {
      livePortrait: true,
      voiceCloning: true,
      talkingAvatar: true
    },
    description: '每月50个credits，所有功能解锁，优先支持',
    tag: '🟣 Recommended',
    paymentLink: 'https://www.creem.io/payment/prod_7GcWnmwWJ9vqqO8LirnCCA'
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    credits: 150,
    features: {
      livePortrait: true,
      voiceCloning: true,
      talkingAvatar: true
    },
    description: '每月150个credits，所有功能解锁，专属客户支持',
    tag: '⭐ Ultimate',
    paymentLink: 'https://www.creem.io/payment/prod_7GcWnmwWJ9vqqO8LirnCCA'
  }
};

// 一次性购买积分包
export const CREDIT_PACKAGES = {
  small: {
    name: '10 Credits',
    price: 7.99,
    credits: 10,
    description: '一次性购买10个credits'
  },
  medium: {
    name: '25 Credits',
    price: 16.99,
    credits: 25,
    description: '一次性购买25个credits，节省15%'
  },
  large: {
    name: '50 Credits',
    price: 29.99,
    credits: 50,
    description: '一次性购买50个credits，节省25%'
  }
};

// 使用订阅Hook
export const useSubscription = () => {
  const { user, userPlan, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [extendedUserPlan, setExtendedUserPlan] = useState<ExtendedUserPlanData | null>(null);
  
  // 加载扩展的用户计划数据
  useEffect(() => {
    if (userPlan) {
      setExtendedUserPlan(userPlan as ExtendedUserPlanData);
      setLoading(false);
    } else {
      setExtendedUserPlan(null);
      setLoading(authLoading);
    }
  }, [userPlan, authLoading]);

  // 获取当前订阅计划
  const getCurrentPlan = (): SubscriptionPlan => {
    if (!extendedUserPlan) return 'free';
    return (extendedUserPlan.plan as SubscriptionPlan) || 'free';
  };

  // 订阅计划
  const subscribeToPlan = async (plan: 'basic' | 'pro') => {
    if (!user) {
      setError('Please log in to subscribe');
      return false;
    }

    if (processing) return false;

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 处理支付前的预处理
      // 实际应用中，这里应该重定向到支付页面，而不是直接处理订阅
      // 这里模拟了支付成功的情况
      const result = await processSubscription(user.uid, plan);
      
      if (result.success) {
        setSuccessMessage(`Successfully subscribed to ${plan} plan!`);
        return true;
      } else {
        setError('Subscription processing failed');
        return false;
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to process subscription');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // 取消订阅
  const cancelSubscription = async () => {
    if (!user) {
      setError('Please log in to manage your subscription');
      return false;
    }

    if (processing) return false;

    setProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 在实际应用中，这里应该调用取消订阅的API
      const userPlanRef = doc(db, 'userPlans', user.uid);
      
      await updateDoc(userPlanRef, {
        subscriptionActive: false,
        subscriptionCancelled: Timestamp.now()
      });
      
      setSuccessMessage('Subscription cancelled successfully');
      return true;
    } catch (err: any) {
      console.error('Cancel subscription error:', err);
      setError(err.message || 'Failed to cancel subscription');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // 检查是否有活跃订阅
  const hasActiveSubscription = (): boolean => {
    if (!extendedUserPlan) return false;
    return extendedUserPlan.subscriptionActive === true;
  };

  // 获取支付链接
  const getPaymentLink = (plan: 'basic' | 'pro'): string => {
    const baseLink = SUBSCRIPTION_PLANS[plan].paymentLink;
    
    // 添加用户ID作为查询参数，以便支付完成后识别用户
    if (user) {
      return `${baseLink}?userId=${user.uid}`;
    }
    
    return baseLink;
  };

  return {
    getCurrentPlan,
    subscribeToPlan,
    cancelSubscription,
    hasActiveSubscription,
    getPaymentLink,
    loading: loading || authLoading,
    processing,
    error,
    successMessage
  };
};

export default useSubscription; 