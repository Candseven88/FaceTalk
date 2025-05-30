import { useAuth } from './useAuth';
import { useState } from 'react';
import { doc, updateDoc, getDoc, getFirestore } from 'firebase/firestore';

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
  const db = getFirestore();

  /**
   * Deduct points from user account when using a feature
   */
  const deductPoints = async (feature: string): Promise<boolean> => {
    setError(null);
    
    if (!user) {
      setError('You must be logged in to use this feature');
      return false;
    }

    if (!canUseFeature(feature)) {
      setError('Not enough points. Please upgrade your plan.');
      return false;
    }

    const cost = FEATURE_COSTS[feature] || 0;
    
    try {
      setIsDeducting(true);
      
      // Get the latest user plan data to ensure we have the most recent point count
      const userDocRef = doc(db, 'userPlans', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        setError('User plan not found');
        return false;
      }
      
      const currentPlan = userDocSnap.data();
      const newPointsLeft = currentPlan.pointsLeft - cost;
      
      if (newPointsLeft < 0) {
        setError('Not enough points. Please upgrade your plan.');
        return false;
      }
      
      // Update the points in Firestore
      await updateDoc(userDocRef, {
        pointsLeft: newPointsLeft
      });
      
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
    return userPlan?.pointsLeft || 0;
  };

  /**
   * Get the cost of a specific feature
   */
  const getFeatureCost = (feature: string): number => {
    return FEATURE_COSTS[feature] || 0;
  };

  return {
    deductPoints,
    isDeducting,
    error,
    getRemainingPoints,
    getFeatureCost
  };
}; 