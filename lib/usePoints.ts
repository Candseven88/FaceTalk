'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, updateDoc, Timestamp, db } from './firebase';

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

  // 启用无限积分模式函数
  const enableUnlimitedPoints = () => {
    localStorage.setItem('dev_unlimited_points', 'true');
    localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, '999');
    console.log('🎮 开发模式：已启用无限积分！');
    window.location.reload();
  };

  // 如果URL中包含dev_unlimited=true参数，自动启用无限积分
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('dev_unlimited') === 'true') {
        enableUnlimitedPoints();
      }
    }
  }, []);

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
        console.log('No points in localStorage, using default 100');
        setLocalPointsLeft(100);
        localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, '100');
      }
    }
  }, [userPlan]);

  // Feature costs
  const FEATURE_COSTS = {
    livePortrait: 2,
    voiceCloning: 1,
    talkingPortrait: 4,
  };

  /**
   * Deduct points for using a feature
   */
  const deductPoints = async (feature: string): Promise<boolean> => {
    console.log(`Attempting to deduct points for feature: ${feature}`);
    
    // 在开发环境中，始终允许使用功能而不扣除积分
    if (typeof window !== 'undefined' && localStorage.getItem('dev_unlimited_points') === 'true') {
      console.log('Development mode: Allowing feature use without deducting points');
      return true;
    }
    
    setIsDeducting(true);
    setError(null);
    
    try {
      // Get feature cost
      const cost = getFeatureCost(feature);
      
      // Check if user can use the feature
      if (!canUseFeature(feature)) {
        console.log(`User cannot use feature: ${feature} - insufficient points`);
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
      let pointsLeft = storedPoints ? parseInt(storedPoints, 10) : 100; // Default 100 points for anonymous users
      
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
    return storedPoints ? parseInt(storedPoints, 10) : 100; // Default 100 points
  };

  return {
    deductPoints,
    isDeducting,
    error,
    getFeatureCost,
    getRemainingPoints,
    enableUnlimitedPoints
  };
}; 