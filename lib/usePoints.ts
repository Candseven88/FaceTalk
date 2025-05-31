import { useAuth } from './useAuth';
import { useState, useEffect } from 'react';
import { doc, updateDoc, db } from './firebase';

// 本地存储键名
const LOCAL_STORAGE_POINTS_KEY = 'facetalk_points_left';

// Feature costs mapping
const FEATURE_COSTS: Record<string, number> = {
  livePortrait: 2,
  voiceCloning: 1,
  talkingPortrait: 4
};

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
        console.log('No points in localStorage, using default 3');
        setLocalPointsLeft(3);
        localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, '3');
      }
    }
  }, [userPlan]);

  /**
   * Deduct points from user account when using a feature
   */
  const deductPoints = async (feature: string): Promise<boolean> => {
    console.log(`Attempting to deduct points for feature: ${feature}`);
    setError(null);
    
    // 使用本地点数作为回退
    const currentPoints = userPlan?.pointsLeft ?? localPointsLeft ?? 0;
    const cost = FEATURE_COSTS[feature] || 0;
    
    console.log(`Feature cost: ${cost}, Current points (userPlan or local): ${currentPoints}`);
    
    if (currentPoints < cost) {
      console.log(`Not enough points to use feature: ${feature}`);
      setError('Not enough points. Please upgrade your plan.');
      return false;
    }
    
    try {
      setIsDeducting(true);
      console.log('Starting points deduction process');
      
      // 更新本地点数
      const newPointsLeft = currentPoints - cost;
      setLocalPointsLeft(newPointsLeft);
      localStorage.setItem(LOCAL_STORAGE_POINTS_KEY, newPointsLeft.toString());
      
      // 如果有用户和userPlan，也更新Firestore
      if (user && userPlan) {
        console.log(`Updating points in Firestore for UID: ${user.uid}`);
        
        try {
          await updateDoc(doc(db, 'userPlans', user.uid), {
            pointsLeft: newPointsLeft
          });
          console.log('Points successfully updated in Firestore');
        } catch (updateError) {
          console.error('Error updating points in Firestore:', updateError);
          // 继续使用本地更新的点数，但记录错误
        }
      } else {
        console.log('No user or userPlan, only updated local points');
      }
      
      console.log(`Successfully deducted ${cost} points. Remaining: ${newPointsLeft}`);
      return true;
    } catch (err) {
      console.error('Error deducting points:', err);
      setError('Failed to deduct points. Please try again.');
      return false;
    } finally {
      setIsDeducting(false);
    }
  };

  /**
   * Get the remaining points for UI display
   */
  const getRemainingPoints = (): number => {
    // 优先使用userPlan中的点数，其次使用本地存储的点数，最后默认为0
    const points = userPlan?.pointsLeft ?? localPointsLeft ?? 0;
    console.log(`Getting remaining points: ${points}`);
    return points;
  };

  /**
   * Get the cost of a specific feature
   */
  const getFeatureCost = (feature: string): number => {
    const cost = FEATURE_COSTS[feature] || 0;
    console.log(`Getting cost for feature ${feature}: ${cost}`);
    return cost;
  };

  return {
    deductPoints,
    isDeducting,
    error,
    getRemainingPoints,
    getFeatureCost
  };
}; 