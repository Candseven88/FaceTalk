'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
// Import from our mock implementation instead of actual Firebase
import { 
  initializeApp, 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  User,
  getFirestore,
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Timestamp
} from './firebase-mock';

// Firebase configuration - keeping for reference but using mock implementation
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-project-id.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase (using our mock)
const app = initializeApp();
const auth = getAuth();
const db = getFirestore();

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

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  userPlan: null,
  canUseFeature: () => false,
  updateUserPlan: async () => {},
  checkAndResetPoints: async () => {},
});

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

  useEffect(() => {
    // Create an anonymous user if not logged in
    const initializeAuth = async () => {
      try {
        // Create anonymous user if not already logged in
        if (!auth.currentUser) {
          const result = await signInAnonymously();
          console.log("Anonymous user created successfully", result.user?.uid);
        }
      } catch (error) {
        console.error("Error during anonymous authentication:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("User authenticated with UID:", currentUser.uid);
        // Set default user plan with mock data 
        setUserPlan({
          plan: 'free',
          pointsLeft: 3,
          startDate: Timestamp.now()
        });
        setLoading(false);
        
        return () => {};
      } else {
        setUserPlan(null);
        setLoading(false);
      }
    });

    initializeAuth();
    return () => unsubscribeAuth();
  }, []);

  /**
   * Check if a user has enough points to use a feature
   */
  const canUseFeature = (feature: string): boolean => {
    if (!userPlan) return false;
    
    const cost = FEATURE_COSTS[feature as keyof typeof FEATURE_COSTS] || 0;
    return userPlan.pointsLeft >= cost;
  };

  /**
   * Update user plan after successful payment
   */
  const updateUserPlan = async (uid: string, plan: UserPlan, points: number): Promise<void> => {
    // Mock implementation - just update local state
    setUserPlan({
      plan,
      pointsLeft: points,
      startDate: Timestamp.now()
    });
  };

  /**
   * Check and reset points if 30 days have passed for paid plans
   */
  const checkAndResetPoints = async (): Promise<void> => {
    if (!user || !userPlan || userPlan.plan === 'free') return;
    
    const startDate = userPlan.startDate.toDate();
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference >= 30) {
      const pointsToReset = userPlan.plan === 'starter' ? 20 : 80;
      
      // Mock implementation - just update local state
      setUserPlan({
        ...userPlan,
        pointsLeft: pointsToReset,
        startDate: Timestamp.now()
      });
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