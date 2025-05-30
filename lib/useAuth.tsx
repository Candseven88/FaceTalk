'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3r97BabQ1M06tpQbuUGH70mNVALvc-Zc",
  authDomain: "facemojo-ccb1b.firebaseapp.com",
  projectId: "facemojo-ccb1b",
  storageBucket: "facemojo-ccb1b.firebasestorage.app",
  messagingSenderId: "7085206135",
  appId: "1:7085206135:web:b4ec995e9b3c70e201f472"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
          await signInAnonymously(auth);
          console.log("Anonymous user created successfully");
        }
      } catch (error) {
        console.error("Error during anonymous authentication:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser: User | null) => {
      setUser(currentUser);
      
      if (currentUser) {
        console.log("User authenticated with UID:", currentUser.uid);
        // Subscribe to real-time updates for user plan data
        const userDocRef = doc(db, 'userPlans', currentUser.uid);
        
        // Check if user plan exists, if not create a free plan
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          const newUserPlan: UserPlanData = {
            plan: 'free',
            pointsLeft: 3,
            startDate: Timestamp.now()
          };
          await setDoc(userDocRef, newUserPlan);
        }
        
        // Listen for real-time updates
        const unsubscribePlan = onSnapshot(userDocRef, (doc: DocumentSnapshot) => {
          if (doc.exists()) {
            setUserPlan(doc.data() as UserPlanData);
          }
          setLoading(false);
        });
        
        return () => unsubscribePlan();
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
    const userDocRef = doc(db, 'userPlans', uid);
    
    await setDoc(userDocRef, {
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
      
      const userDocRef = doc(db, 'userPlans', user.uid);
      await setDoc(userDocRef, {
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