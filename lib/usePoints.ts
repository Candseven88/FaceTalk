'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, updateDoc, Timestamp, db } from './firebase';
import { getDeviceId } from './useDeviceId';
import { recordDeviceCreditsUsage } from './firebase';

// Local storage keys
const LOCAL_STORAGE_POINTS_KEY = 'facetalk_points';
const LOCAL_STORAGE_LAST_USED_KEY = 'facetalk_last_used';

/**
 * Hook for managing feature points
 */
export const usePoints = () => {
  const { user, userPlan, canUseFeature } = useAuth();
  const [isDeducting, setIsDeducting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPointsLeft, setLocalPointsLeft] = useState<number | null>(null);

  console.log('usePoints hook initialized, userPlan:', userPlan);

  // 从localStorage初始化或使用userPlan更新本地点数
  useEffect(() => {
    if (userPlan) {
      // 如果有userPlan，使用它的点数
      console.log('Setting local points from userPlan:', userPlan.pointsLeft);
      setLocalPointsLeft(userPlan.pointsLeft);
      
      // 同时更新localStorage
      localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, userPlan.pointsLeft.toString());
    } else {
      // 尝试从localStorage获取
      const storedPoints = localStorage.getItem(LOCAL_STORAGE_POINTS_KEY);
      if (storedPoints !== null) {
        const points = parseInt(storedPoints, 10);
        console.log('Retrieved points from localStorage:', points);
        setLocalPointsLeft(points);
      } else {
        // 没有localStorage数据，设置默认值
        console.log('No points in localStorage, using default 4');
        const defaultPoints = 4;
        setLocalPointsLeft(defaultPoints);
        localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, defaultPoints.toString());
      }
    }
  }, [userPlan]);

  // Feature costs
  const FEATURE_COSTS = {
    livePortrait: 2,
    voiceCloning: 1,
    talkingPortrait: 3,
  };

  /**
   * Check if a feature is available for the current user plan
   */
  const isFeatureAvailable = (feature: string): boolean => {
    // 如果是付费用户，所有功能都可用
    if (user && userPlan && (userPlan.plan === 'starter' || userPlan.plan === 'pro')) {
      return true;
    }
    
    // 对于免费用户，限制可用功能
    if (user && userPlan && userPlan.plan === 'free') {
      // 免费用户只能使用Live Portrait和Voice Clone
      if (feature === 'talkingPortrait') {
        return false;
      }
      
      // 检查积分是否足够
      const cost = getFeatureCost(feature);
      return userPlan.pointsLeft >= cost;
    }
    
    // 匿名用户同样有限制
    if (feature === 'talkingPortrait') {
      return false;
    }
    
    // 检查本地积分
    const currentPoints = getRemainingPoints();
    const cost = getFeatureCost(feature);
    return currentPoints >= cost;
  };

  /**
   * Deduct points for using a feature
   */
  const deductPoints = async (feature: string): Promise<boolean> => {
    console.log(`Attempting to deduct points for feature: ${feature}`);
    setIsDeducting(true);
    setError(null);
    
    // 首先检查功能是否可用
    if (!isFeatureAvailable(feature)) {
      if (feature === 'talkingPortrait') {
        setError('This feature is not available for free users. Please upgrade your plan.');
      } else {
        setError('Not enough points to use this feature');
      }
      setIsDeducting(false);
      return false;
    }
    
    try {
      // Get feature cost
      const cost = getFeatureCost(feature);
      
      // 获取当前可用积分
      const currentPoints = getRemainingPoints();
      console.log(`Current points: ${currentPoints}, Cost: ${cost}`);
      
      // 检查是否有足够的积分
      if (currentPoints < cost) {
        console.log(`Insufficient points: ${currentPoints}/${cost}`);
        setError('Not enough points to use this feature');
        return false;
      }
      
      // If user is authenticated, deduct points from Firestore
      if (user && userPlan) {
        console.log(`Deducting ${cost} points from authenticated user plan`);
        try {
          const userPlanRef = doc(db, 'userPlans', user.uid);
          const newPointsLeft = Math.max(0, userPlan.pointsLeft - cost);
          const usedPoints = (userPlan.usedPoints || 0) + cost;
          
          // Update Firestore
          await updateDoc(userPlanRef, {
            pointsLeft: newPointsLeft,
            usedPoints: usedPoints,
            lastUpdated: Timestamp.now()
          });
          
          console.log(`Points deducted successfully. Remaining: ${newPointsLeft}`);
          return true;
        } catch (firestoreError) {
          console.error('Error updating points in Firestore:', firestoreError);
          // Fall back to local storage
          return await deductLocalPoints(feature, cost);
        }
      } else {
        // For anonymous users or when Firestore fails, use localStorage
        console.log('Using localStorage for points tracking');
        return await deductLocalPoints(feature, cost);
      }
    } catch (err) {
      console.error('Error deducting points:', err);
      setError('Failed to process points');
      return false;
    } finally {
      setIsDeducting(false);
    }
  };

  /**
   * Deduct points from localStorage for anonymous users
   */
  const deductLocalPoints = async (feature: string, cost: number): Promise<boolean> => {
    try {
      // Get current points from localStorage
      const storedPoints = localStorage.getItem(LOCAL_STORAGE_POINTS_KEY);
      let pointsLeft = storedPoints ? parseInt(storedPoints, 10) : 4; // Default 4 points for anonymous users
      
      // If no points left, return false
      if (pointsLeft < cost) {
        console.log(`Insufficient local points: ${pointsLeft}/${cost}`);
        setError('Not enough points to use this feature');
        return false;
      }
      
      // Deduct points
      pointsLeft -= cost;
      localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, pointsLeft.toString());
      
      // Track last used timestamp
      localStorage.setItem(LOCAL_STORAGE_LAST_USED_KEY, new Date().toISOString());
      
      // 当用户使用功能并从本地扣除积分时，记录设备已使用免费积分
      try {
        const deviceId = await getDeviceId();
        await recordDeviceCreditsUsage(deviceId);
        console.log('Device credits usage recorded for anonymous user');
      } catch (deviceError) {
        console.warn('Error recording device usage:', deviceError);
        // 继续执行，不影响用户体验
      }
      
      console.log(`Local points deducted. Remaining: ${pointsLeft}`);
      return true;
    } catch (err) {
      console.error('Error deducting local points:', err);
      setError('Failed to process points');
      return false;
    }
  };

  /**
   * Get cost of a feature
   */
  const getFeatureCost = (feature: string): number => {
    return FEATURE_COSTS[feature as keyof typeof FEATURE_COSTS] || 0;
  };

  /**
   * Get remaining points for the user
   */
  const getRemainingPoints = (): number => {
    // If user is authenticated, use Firestore data
    if (user && userPlan) {
      return userPlan.pointsLeft;
    }
    
    // Otherwise use localStorage
    const storedPoints = localStorage.getItem(LOCAL_STORAGE_POINTS_KEY);
    if (storedPoints === null) {
      // 如果没有存储点数，初始化为4
      const defaultPoints = 4;
      localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, defaultPoints.toString());
      return defaultPoints;
    }
    
    return parseInt(storedPoints, 10);
  };

  return {
    deductPoints,
    isDeducting,
    error,
    getFeatureCost,
    getRemainingPoints,
    isFeatureAvailable
  };
}; 