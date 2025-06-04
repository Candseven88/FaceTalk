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
  Timestamp,
  checkDeviceCreditsUsage,
  recordDeviceCreditsUsage
} from './firebase';
// Import from useDeviceId
import { getDeviceId } from './useDeviceId';

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
  usedPoints?: number;
  lastUpdated?: Timestamp;
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

// 本地存储的键名
const LOCAL_STORAGE_UID_KEY = 'facetalk_user_uid';
const LOCAL_STORAGE_AUTH_STATE = 'facetalk_auth_state';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<UserPlanData | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Feature credit costs
  const FEATURE_COSTS = {
    livePortrait: 2,
    voiceCloning: 1,
    talkingPortrait: 4,
  };

  console.log('AuthProvider initialized');

  // Force sync auth state with localStorage for cross-tab communication
  useEffect(() => {
    if (user) {
      // Save auth state to localStorage when user changes
      localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
        isLoggedIn: true,
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        lastUpdated: new Date().toISOString()
      }));
    }
  }, [user]);

  // Listen for storage events to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_AUTH_STATE) {
        console.log('Auth state changed in another tab');
        try {
          const authState = JSON.parse(e.newValue || '{}');
          if (authState.isLoggedIn && authState.uid && !user) {
            console.log('Another tab logged in, refreshing auth state');
            window.location.reload();
          } else if (!authState.isLoggedIn && user) {
            console.log('Another tab logged out, refreshing auth state');
            window.location.reload();
          }
        } catch (error) {
          console.error('Error parsing auth state from storage', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    // Create an anonymous user if not logged in
    const initializeAuth = async () => {
      try {
        // Try to read cached auth state from localStorage first for immediate UI response
        const cachedAuthState = localStorage.getItem(LOCAL_STORAGE_AUTH_STATE);
        if (cachedAuthState) {
          try {
            const authState = JSON.parse(cachedAuthState);
            // Only use cached state if it's recent (last 30 minutes)
            const lastUpdated = new Date(authState.lastUpdated);
            const isRecent = (new Date().getTime() - lastUpdated.getTime()) < 30 * 60 * 1000;
            
            if (authState.isLoggedIn && isRecent) {
              console.log('Using cached auth state', authState);
              // Simulate user object for immediate UI response while Firebase initializes
              if (!user) {
                setUser({
                  uid: authState.uid,
                  isAnonymous: authState.isAnonymous || false
                } as User);
              }
            }
          } catch (error) {
            console.error('Error parsing cached auth state', error);
            localStorage.removeItem(LOCAL_STORAGE_AUTH_STATE);
          }
        }

        // 检查localStorage中是否存在存储的用户ID
        const storedUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
        console.log('Stored UID from localStorage:', storedUid);

        if (auth.currentUser) {
          console.log('Current user exists:', auth.currentUser.uid);
          // 确保存储当前用户的UID
          localStorage.setItem(LOCAL_STORAGE_UID_KEY, auth.currentUser.uid);
          
          // Update auth state in localStorage
          localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
            isLoggedIn: true,
            uid: auth.currentUser.uid,
            isAnonymous: auth.currentUser.isAnonymous,
            lastUpdated: new Date().toISOString()
          }));
        } else if (storedUid) {
          console.log('No current user but found stored UID:', storedUid);
          // 我们有存储的UID但没有当前用户，这可能是因为页面刷新
          // Firebase会自动使用匿名认证，所以不需要主动做任何事情
          // 我们只需要等待onAuthStateChanged回调被触发
        } else {
          console.log('No current user and no stored UID, signing in anonymously');
          // 创建新的匿名用户
          const result = await signInAnonymously();
          console.log("Anonymous user created successfully", result.user?.uid);
          
          // 存储用户ID到localStorage
          if (result.user) {
            localStorage.setItem(LOCAL_STORAGE_UID_KEY, result.user.uid);
            console.log("User ID saved to localStorage:", result.user.uid);
            
            // Update auth state in localStorage
            localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
              isLoggedIn: true,
              uid: result.user.uid,
              isAnonymous: true,
              lastUpdated: new Date().toISOString()
            }));
          }
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error("Error during anonymous authentication:", error);
        // Clear any problematic stored UID that might be causing errors
        localStorage.removeItem(LOCAL_STORAGE_UID_KEY);
        
        // Try one more time after a delay
        setTimeout(async () => {
          try {
            const result = await signInAnonymously();
            if (result.user) {
              localStorage.setItem(LOCAL_STORAGE_UID_KEY, result.user.uid);
              console.log("Retry: Anonymous user created successfully", result.user.uid);
              
              // Update auth state in localStorage
              localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
                isLoggedIn: true,
                uid: result.user.uid,
                isAnonymous: true,
                lastUpdated: new Date().toISOString()
              }));
            }
            setAuthInitialized(true);
          } catch (retryError) {
            console.error("Retry error during anonymous authentication:", retryError);
            setAuthInitialized(true);
          }
        }, 1000);
      }
    };

    // Use a timeout to prevent indefinite loading state
    const authTimeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth state is still loading after timeout, forcing state update');
        setLoading(false);
        setAuthInitialized(true);
        
        // If we have no user after timeout, create an anonymous one
        if (!user) {
          initializeAuth();
        }
      }
    }, 5000);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser: User | null) => {
      console.log('Auth state changed, user:', currentUser ? currentUser.uid : 'null');
      
      if (currentUser) {
        console.log("User authenticated with UID:", currentUser.uid);
        
        // 确保UID保存到localStorage，用于跨会话持久化
        localStorage.setItem(LOCAL_STORAGE_UID_KEY, currentUser.uid);
        console.log("User ID saved/updated in localStorage");
        
        // Update auth state in localStorage
        localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
          isLoggedIn: true,
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous,
          lastUpdated: new Date().toISOString()
        }));
        
        setUser(currentUser);
        
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
            // No user plan yet, create default one with credits based on device usage
            console.log('Creating new user plan');
            
            // 获取设备ID并检查是否已使用过免费积分
            const deviceId = await getDeviceId();
            const hasUsedFreeCredits = await checkDeviceCreditsUsage(deviceId);
            
            // 确定初始积分 - 如果设备已用过免费积分，只给1点作为示例，否则给4点
            const initialCredits = hasUsedFreeCredits ? 1 : 4;
            
            const defaultPlan: UserPlanData = {
              plan: 'free',
              pointsLeft: initialCredits,
              startDate: Timestamp.now(),
              usedPoints: 0,
              lastUpdated: Timestamp.now()
            };
            
            // 如果这是一个新设备并获得了免费积分，记录设备已使用免费积分
            if (!hasUsedFreeCredits && initialCredits > 1) {
              await recordDeviceCreditsUsage(deviceId);
              console.log('Recorded device credits usage for new device');
            }
            
            // Save default plan to Firestore
            console.log('Saving default plan to Firestore with', initialCredits, 'credits');
            try {
              await setDoc(userPlanRef, defaultPlan);
              console.log('Default plan saved successfully');
              
              // 确保本地存储也有相同的积分
              localStorage.setItem('facetalk_points', initialCredits.toString());
            } catch (setDocError) {
              console.error('Error saving default plan:', setDocError);
            }
            
            setUserPlan(defaultPlan);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
          // Fallback to default user plan if Firestore fails
          console.log('Using fallback user plan');
          const fallbackPlan = {
            plan: 'free' as UserPlan,
            pointsLeft: 4,
            startDate: Timestamp.now(),
            usedPoints: 0,
            lastUpdated: Timestamp.now()
          };
          setUserPlan(fallbackPlan);
          
          // 确保本地存储也有积分记录
          localStorage.setItem('facetalk_points', '4');
        }
        
        setLoading(false);
      } else {
        console.log('No authenticated user');
        
        // Update auth state in localStorage to reflect logged out state
        localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
          isLoggedIn: false,
          lastUpdated: new Date().toISOString()
        }));
        
        setUserPlan(null);
        setLoading(false);
        
        // 如果没有认证用户但localStorage中有UID，尝试使用该UID进行认证
        const storedUid = localStorage.getItem(LOCAL_STORAGE_UID_KEY);
        if (storedUid) {
          console.log('No authenticated user but found stored UID. Will try to sign in.');
          // 由于我们使用的是匿名认证，无法直接使用UID重新认证
          // 最好的方法是创建一个新的匿名用户
          try {
            const result = await signInAnonymously();
            console.log("Created new anonymous user:", result.user?.uid);
            if (result.user) {
              localStorage.setItem(LOCAL_STORAGE_UID_KEY, result.user.uid);
              
              // Update auth state in localStorage
              localStorage.setItem(LOCAL_STORAGE_AUTH_STATE, JSON.stringify({
                isLoggedIn: true,
                uid: result.user.uid,
                isAnonymous: true,
                lastUpdated: new Date().toISOString()
              }));
              
              // 确保新创建的匿名用户有默认积分
              localStorage.setItem('facetalk_points', '4');
            }
          } catch (error) {
            console.error("Error creating new anonymous user:", error);
          }
        }
      }
    });

    initializeAuth();
    return () => {
      console.log('Unsubscribing from auth state changes');
      unsubscribeAuth();
      clearTimeout(authTimeoutId);
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
        startDate: Timestamp.now(),
        usedPoints: 0,
        lastUpdated: Timestamp.now()
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
          usedPoints: 0,
          startDate: Timestamp.now(),
          lastUpdated: Timestamp.now()
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