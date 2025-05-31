'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
// Import from our real Firebase implementation
import { 
  auth,
  db,
  onAuthStateChanged, 
  signInAnonymously, 
  User,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  Timestamp
} from './firebase';

// Firebase configuration is now in firebase.ts

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  userPlan: null,
  canUseFeature: () => false,
  updateUserPlan: async () => {},
  checkAndResetPoints: async () => {},
});

export type UserPlan = 'free' | 'starter' | 'pro';

export interface UserPlanData {
  plan: UserPlan;
  pointsLeft: number;
  startDate: Timestamp;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  userPlan: UserPlanData | null;
  canUseFeature: (feature: string) => boolean;
  updateUserPlan: (uid: string, plan: UserPlan, points: number) => Promise<void>;
  checkAndResetPoints: () => Promise<void>;
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);

  // Feature credit costs
  const FEATURE_COSTS = {
    livePortrait: 2,
    voiceCloning: 1,
    talkingPortrait: 4,
  };

  console.log('AuthProvider initialized');

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    // Create an anonymous user if not logged in
    const initializeAuth = async () => {
      console.log('initializeAuth called, auth.currentUser:', auth.currentUser ? 'exists' : 'null');
      try {
        // Create anonymous user if not already logged in
        if (!auth.currentUser) {
          console.log('No current user, signing in anonymously');
          const result = await signInAnonymously();
          console.log("Anonymous user created successfully", result.user?.uid);
        } else {
          console.log('Current user exists:', auth.currentUser.uid);
        }
      } catch (error) {
        console.error("Error during anonymous authentication:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser: User | null) => {
      console.log('Auth state changed, user:', currentUser ? currentUser.uid : 'null');
      setUser(currentUser);
      
      if (currentUser) {
        console.log("User authenticated with UID:", currentUser.uid);
        
        // Get user plan from Firestore if exists
        try {
          console.log('Fetching user plan from Firestore for UID:', currentUser.uid);
          const userPlanRef = doc(db, 'userPlans', currentUser.uid);
          console.log('User plan ref created');
          
          const userPlanDoc = await getDoc(userPlanRef);
          console.log('User plan doc fetched, exists:', userPlanDoc.exists());
          
          if (userPlanDoc.exists()) {
            // User plan exists, use data from Firestore
            const data = userPlanDoc.data() as UserPlanData;
            console.log('User plan exists in Firestore:', data);
            setUserPlan(data);
          } else {
            // No user plan yet, create default one with 3 points for free users
            console.log('Creating new user plan with 3 points');
            const defaultPlan: UserPlanData = {
              plan: 'free',
              pointsLeft: 3, // Free users get 3 points
              startDate: Timestamp.now()
            };
            
            // Save default plan to Firestore
            console.log('Saving default plan to Firestore');
            try {
              await setDoc(userPlanRef, defaultPlan);
              console.log('Default plan saved successfully');
            } catch (setDocError) {
              console.error('Error saving default plan:', setDocError);
            }
            
            setUserPlan(defaultPlan);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
          // Fallback to default user plan if Firestore fails
          console.log('Using fallback user plan');
          setUserPlan({
            plan: 'free',
            pointsLeft: 3,
            startDate: Timestamp.now()
          });
        }
        
        setLoading(false);
      } else {
        console.log('No authenticated user');
        setUserPlan(null);
        setLoading(false);
      }
    });

    initializeAuth();
    return () => {
      console.log('Unsubscribing from auth state changes');
      unsubscribeAuth();
    };
  }, []);

  /**
   * Check if a user has enough points to use a feature
   */
  const canUseFeature = (feature: string): boolean => {
    console.log(`Checking if can use feature: ${feature}, userPlan:`, userPlan);
    if (!userPlan) return false;
    
    const cost = FEATURE_COSTS[feature as keyof typeof FEATURE_COSTS] || 0;
    const hasEnoughPoints = userPlan.pointsLeft >= cost;
    console.log(`Feature: ${feature}, Cost: ${cost}, Points left: ${userPlan.pointsLeft}, Can use: ${hasEnoughPoints}`);
    return hasEnoughPoints;
  };

  /**
   * Update user plan after successful payment
   */
  const updateUserPlan = async (uid: string, plan: UserPlan, points: number): Promise<void> => {
    console.log(`Updating user plan: UID=${uid}, Plan=${plan}, Points=${points}`);
    try {
      const newPlan: UserPlanData = {
        plan,
        pointsLeft: points,
        startDate: Timestamp.now()
      };
      
      // Update in Firestore
      console.log('Updating plan in Firestore');
      await setDoc(doc(db, 'userPlans', uid), newPlan);
      console.log('Plan updated in Firestore');
      
      // Update local state
      setUserPlan(newPlan);
    } catch (error) {
      console.error("Error updating user plan:", error);
      throw error;
    }
  };

  /**
   * Check and reset points if 30 days have passed for paid plans
   */
  const checkAndResetPoints = async (): Promise<void> => {
    console.log('Checking if points need to be reset', { user, userPlan });
    if (!user || !userPlan || userPlan.plan === 'free') return;
    
    const startDate = userPlan.startDate.toDate();
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`Days since last reset: ${daysDifference}`);
    
    if (daysDifference >= 30) {
      console.log('Resetting points for paid plan');
      const pointsToReset = userPlan.plan === 'starter' ? 20 : 80;
      
      try {
        const resetPlan = {
          ...userPlan,
          pointsLeft: pointsToReset,
          startDate: Timestamp.now()
        };
        
        // Update in Firestore
        console.log('Updating reset plan in Firestore');
        await updateDoc(doc(db, 'userPlans', user.uid), resetPlan);
        console.log('Reset plan updated in Firestore');
        
        // Update local state
        setUserPlan(resetPlan);
      } catch (error) {
        console.error("Error resetting points:", error);
      }
    }
  };

  const value = {
    user,
    loading,
    userPlan,
    canUseFeature,
    updateUserPlan,
    checkAndResetPoints
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 