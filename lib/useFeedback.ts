'use client';

import { useState } from 'react';
import { useAuth } from './useAuth';
import { saveUserFeedback } from './firebase';

// 反馈类型
export type FeedbackType = 'bug' | 'feature' | 'general' | 'satisfaction';

// 反馈数据接口
export interface FeedbackData {
  type: FeedbackType;
  message: string;
  rating?: number;
  contactInfo?: string;
  metadata?: Record<string, any>;
}

// 使用反馈Hook
export const useFeedback = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 提交用户反馈
  const submitFeedback = async (feedbackData: FeedbackData) => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 添加默认元数据
      const enhancedFeedback = {
        ...feedbackData,
        metadata: {
          ...feedbackData.metadata,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      };

      // 保存到Firebase
      const feedbackId = await saveUserFeedback(user?.uid || 'anonymous', enhancedFeedback);
      
      if (feedbackId) {
        setSuccess(true);
        return true;
      } else {
        setError('Failed to submit feedback');
        return false;
      }
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'Failed to submit feedback');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // 重置状态
  const resetFeedbackState = () => {
    setError(null);
    setSuccess(false);
  };

  // 显示满意度调查
  const showSatisfactionSurvey = (featureUsed: string) => {
    // 将本地存储中记录使用次数
    const storageKey = `facetalk_feature_${featureUsed}_usage`;
    let usageCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
    usageCount++;
    localStorage.setItem(storageKey, usageCount.toString());
    
    // 只在使用次数为3、10、25时显示调查
    return [3, 10, 25].includes(usageCount);
  };

  return {
    submitFeedback,
    resetFeedbackState,
    showSatisfactionSurvey,
    submitting,
    error,
    success
  };
};

export default useFeedback; 