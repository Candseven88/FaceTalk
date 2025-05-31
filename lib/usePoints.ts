import { useAuth } from './useAuth';
import { useState } from 'react';
import { doc, updateDoc, db } from './firebase';

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

  console.log('usePoints hook initialized, userPlan:', userPlan);

  /**
   * Deduct points from user account when using a feature
   */
  const deductPoints = async (feature: string): Promise<boolean> => {
    console.log(`Attempting to deduct points for feature: ${feature}`);
    setError(null);
    
    if (!user) {
      console.log('No user found, cannot deduct points');
      setError('You must be logged in to use this feature');
      return false;
    }

    console.log(`Checking if user can use feature: ${feature}, User UID: ${user.uid}`);
    if (!canUseFeature(feature)) {
      console.log(`Not enough points to use feature: ${feature}`);
      setError('Not enough points. Please upgrade your plan.');
      return false;
    }

    const cost = FEATURE_COSTS[feature] || 0;
    console.log(`Feature cost: ${cost}, Current points: ${userPlan?.pointsLeft || 0}`);
    
    try {
      setIsDeducting(true);
      console.log('Starting points deduction process');
      
      // Actually deduct points in Firebase
      if (userPlan) {
        const newPointsLeft = userPlan.pointsLeft - cost;
        console.log(`Calculating new points: ${userPlan.pointsLeft} - ${cost} = ${newPointsLeft}`);
        
        // Update in Firestore
        console.log(`Updating points in Firestore for UID: ${user.uid}`);
        try {
          await updateDoc(doc(db, 'userPlans', user.uid), {
            pointsLeft: newPointsLeft
          });
          console.log('Points successfully updated in Firestore');
        } catch (updateError) {
          console.error('Error updating points in Firestore:', updateError);
          throw updateError;
        }
        
        console.log(`Successfully deducted ${cost} points. Remaining: ${newPointsLeft}`);
        return true;
      }
      
      console.log('No user plan found, cannot deduct points');
      return false;
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
    const points = userPlan?.pointsLeft || 0;
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