// Firebase real implementation
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  linkWithCredential,
  EmailAuthProvider,
  User 
} from 'firebase/auth';
import { 
  getFirestore as firebaseGetFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot as firebaseOnSnapshot,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  increment,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getStorage as firebaseGetStorage, 
  ref as storageRef, 
  uploadString, 
  getDownloadURL,
  uploadBytes,
  deleteObject
} from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Default timeout for Firebase operations (in milliseconds)
const FIREBASE_OPERATION_TIMEOUT = 8000;

// Local cache to reduce Firestore dependencies
const localCache = {
  generations: new Map<string, any[]>(),
  userPlans: new Map<string, any>(),
  deviceCredits: new Map<string, boolean>()
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Add debug logging to check if env vars are loaded
console.log('Firebase Config Check:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Not set',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Set' : 'Not set',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'Set' : 'Not set',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'Set' : 'Not set',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set' : 'Not set',
});

// Initialize Firebase with improved error handling
let app: FirebaseApp;
let auth: any;
let db: any;
let storage: any;
let functions: any;
let firestoreInitialized = false;

try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
  
  // Initialize Auth
  auth = getAuth(app);
  
  // Initialize Firestore with optimized settings
  try {
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    });
    
    // Enable offline persistence (but don't block on failure)
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        console.warn('Firestore persistence could not be enabled:', err.code);
      });
    }
    
    firestoreInitialized = true;
    console.log('Firestore initialized with persistence');
  } catch (firestoreError) {
    console.error('Firestore initialization error:', firestoreError);
    // Fallback to standard Firestore
    db = firebaseGetFirestore(app);
    console.log('Firestore initialized without persistence');
  }
  
  storage = firebaseGetStorage(app);
  functions = getFunctions(app);
  
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Firebase initialization failed');
}

// Add generation record to Firestore with timeout
export const saveGeneration = async (userId: string, type: string, result: string, cost: number) => {
  try {
    const generationData = {
      userId,
      type,
      result,
      timestamp: Timestamp.now(),
      cost
    };
    
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timeout')), FIREBASE_OPERATION_TIMEOUT);
    });
    
    // Add to local cache first
    const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const localGeneration = { ...generationData, id: localId };
    const userGenerations = localCache.generations.get(userId) || [];
    userGenerations.push(localGeneration);
    localCache.generations.set(userId, userGenerations);
    
    // Add to Firestore with timeout
    const firestorePromise = async () => {
      try {
        if (!firestoreInitialized) {
          return localId;
        }
        const docRef = await addDoc(collection(db, 'generations'), generationData);
        console.log('Generation saved to Firestore with ID:', docRef.id);
        
        // Update local cache with real ID
        const updatedGenerations = userGenerations.map(gen => 
          gen.id === localId ? { ...gen, id: docRef.id } : gen
        );
        localCache.generations.set(userId, updatedGenerations);
        
        return docRef.id;
      } catch (error) {
        console.error('Error saving generation to Firestore:', error);
        return localId; // Return local ID if Firestore fails
      }
    };
    
    // Race between the Firestore operation and the timeout
    return Promise.race([firestorePromise(), timeoutPromise]);
  } catch (error) {
    console.error('Error in saveGeneration:', error);
    // Generate a local ID if all else fails
    return `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
};

// Get user generation history with improved reliability
export const getUserGenerations = async (userId: string, maxResults = 10) => {
  try {
    // First check the local cache
    const cachedGenerations = localCache.generations.get(userId);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<any[]>((_, reject) => {
      setTimeout(() => {
        console.log('Firestore getUserGenerations timeout - returning cached data');
        if (cachedGenerations) {
          return cachedGenerations.slice(0, maxResults);
        }
        reject(new Error('Firestore operation timeout'));
      }, FIREBASE_OPERATION_TIMEOUT);
    });
    
    // Create the Firestore operation promise
    const firestorePromise = async () => {
      if (!firestoreInitialized) {
        throw new Error('Firestore not initialized');
      }
      
      const q = query(
        collection(db, 'generations'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );
      
      const querySnapshot = await getDocs(q);
      const generations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update cache with fresh data
      localCache.generations.set(userId, generations);
      
      console.log(`Retrieved ${generations.length} generations for user ${userId}`);
      return generations;
    };
    
    // Try to get fresh data, but fall back to cache if it times out
    try {
      return await Promise.race([firestorePromise(), timeoutPromise]);
    } catch (error) {
      console.error('Error in getUserGenerations Firestore operation:', error);
      
      // Return cached data if available
      if (cachedGenerations && cachedGenerations.length > 0) {
        console.log('Returning cached generations');
        return cachedGenerations.slice(0, maxResults);
      }
      
      // Return empty array if no cache
      return [];
    }
  } catch (error) {
    console.error('Error getting user generations:', error);
    return [];
  }
};

// Update user plan usage stats with resilience
export const updateUsageStats = async (userId: string, pointsUsed: number) => {
  try {
    // First update local cache for immediate UI update
    const cachedPlan = localCache.userPlans.get(userId);
    if (cachedPlan) {
      const newPointsLeft = Math.max(0, (cachedPlan.pointsLeft || 0) - pointsUsed);
      const usedPoints = (cachedPlan.usedPoints || 0) + pointsUsed;
      
      localCache.userPlans.set(userId, {
        ...cachedPlan,
        pointsLeft: newPointsLeft,
        usedPoints: usedPoints,
        lastUpdated: new Date()
      });
    }
    
    // Return early if Firestore isn't initialized
    if (!firestoreInitialized) {
      console.log('Firestore not initialized, skipping remote update');
      return true;
    }
    
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timeout')), FIREBASE_OPERATION_TIMEOUT);
    });
    
    const firestorePromise = async () => {
      const userPlanRef = doc(db, 'userPlans', userId);
      const userPlanDoc = await getDoc(userPlanRef);
      
      if (userPlanDoc.exists()) {
        const userData = userPlanDoc.data();
        const newPointsLeft = Math.max(0, (userData.pointsLeft || 0) - pointsUsed);
        const usedPoints = (userData.usedPoints || 0) + pointsUsed;
        
        await updateDoc(userPlanRef, {
          pointsLeft: newPointsLeft,
          usedPoints: usedPoints,
          lastUpdated: Timestamp.now()
        });
        
        // Update cache with consistent data
        localCache.userPlans.set(userId, {
          ...userData,
          pointsLeft: newPointsLeft,
          usedPoints: usedPoints,
          lastUpdated: Timestamp.now()
        });
        
        console.log(`Updated usage stats for ${userId}: ${pointsUsed} points used, ${newPointsLeft} remaining`);
        return true;
      }
      
      console.log(`User plan not found for ${userId}, cannot update usage stats`);
      return false;
    };
    
    return await Promise.race([firestorePromise(), timeoutPromise]).catch(err => {
      console.error('Error updating usage stats in Firestore:', err);
      return true; // Return success to prevent blocking UI
    });
  } catch (error) {
    console.error('Error updating usage stats:', error);
    return true; // Return success to prevent blocking UI
  }
};

// Save user feedback
export const saveUserFeedback = async (userId: string, feedback: any) => {
  try {
    const feedbackData = {
      userId: userId || 'anonymous',
      ...feedback,
      createdAt: serverTimestamp(),
      status: 'new'
    };
    
    const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
    console.log('Feedback saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving feedback:', error);
    return null;
  }
};

// Process user subscription
export const processSubscription = async (userId: string, plan: string) => {
  try {
    // Determine credits and level
    let credits = 0;
    switch (plan) {
      case 'basic':
        credits = 10;
        break;
      case 'pro':
        credits = 40;
        break;
      default:
        throw new Error('Invalid plan');
    }
    
    // Update user document
    const userRef = doc(db, 'userPlans', userId);
    
    await runTransaction(db, async (transaction) => {
      // Get current user data
      const userDoc = await transaction.get(userRef);
      
      // Prepare update data
      const userData = {
        plan,
        pointsLeft: credits,
        subscriptionActive: true,
        subscriptionPlan: plan,
        subscriptionStart: serverTimestamp(),
        features: {
          livePortrait: true,
          voiceCloning: true,
          talkingAvatar: true
        },
        lastUpdated: serverTimestamp()
      };
      
      // If user document exists, preserve existing fields
      if (userDoc.exists()) {
        transaction.update(userRef, userData);
      } else {
        transaction.set(userRef, {
          ...userData,
          usedPoints: 0,
          createdAt: serverTimestamp()
        });
      }
      
      // Record transaction
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        userId,
        type: 'subscription',
        plan,
        credits,
        amount: plan === 'basic' ? 5.00 : 15.00,
        timestamp: serverTimestamp(),
        status: 'completed'
      });
    });
    
    console.log(`Subscription processed for user ${userId}, plan: ${plan}`);
    return { success: true, credits, plan };
  } catch (error) {
    console.error('Error processing subscription:', error);
    throw error;
  }
};

// Upgrade anonymous user to regular account
export const upgradeAnonymousUser = async (email: string, password: string) => {
  if (!auth.currentUser) {
    throw new Error('No current user');
  }
  
  if (!auth.currentUser.isAnonymous) {
    throw new Error('Current user is not anonymous');
  }
  
  try {
    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);
    console.log('Anonymous account successfully upgraded', result.user);
    return result.user;
  } catch (error) {
    console.error('Error upgrading anonymous account:', error);
    throw error;
  }
};

// Record device free credits usage with improved reliability
export const recordDeviceCreditsUsage = async (deviceId: string) => {
  try {
    // Update local cache first
    localCache.deviceCredits.set(deviceId, true);
    
    // Return early if Firestore isn't initialized
    if (!firestoreInitialized) {
      console.log('Firestore not initialized, skipping remote update');
      return true;
    }
    
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Firestore operation timeout')), FIREBASE_OPERATION_TIMEOUT);
    });
    
    const firestorePromise = async () => {
      const deviceRef = doc(db, 'deviceCredits', deviceId);
      
      // Check if device record exists
      const deviceDoc = await getDoc(deviceRef);
      
      if (deviceDoc.exists()) {
        // Update existing record
        await updateDoc(deviceRef, {
          hasUsedFreeCredits: true,
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create new record
        await setDoc(deviceRef, {
          deviceId,
          hasUsedFreeCredits: true,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      console.log('Device credits usage recorded for device:', deviceId);
      return true;
    };
    
    return await Promise.race([firestorePromise(), timeoutPromise]).catch(err => {
      console.error('Error recording device credits usage in Firestore:', err);
      return true; // Return success to prevent blocking UI
    });
  } catch (error) {
    console.error('Error recording device credits usage:', error);
    return true; // Return success to prevent blocking UI
  }
};

// Check if device has already used free credits with local caching
export const checkDeviceCreditsUsage = async (deviceId: string): Promise<boolean> => {
  try {
    // Check local cache first
    if (localCache.deviceCredits.has(deviceId)) {
      return localCache.deviceCredits.get(deviceId) || false;
    }
    
    // Return false if Firestore isn't initialized
    if (!firestoreInitialized) {
      console.log('Firestore not initialized, assuming device has not used credits');
      return false;
    }
    
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        console.log('Firestore checkDeviceCreditsUsage timeout - assuming false');
        return false;
      }, FIREBASE_OPERATION_TIMEOUT);
    });
    
    const firestorePromise = async () => {
      const deviceRef = doc(db, 'deviceCredits', deviceId);
      const deviceDoc = await getDoc(deviceRef);
      
      if (deviceDoc.exists()) {
        const deviceData = deviceDoc.data();
        const hasUsed = deviceData.hasUsedFreeCredits === true;
        
        // Update local cache
        localCache.deviceCredits.set(deviceId, hasUsed);
        
        return hasUsed;
      }
      
      // Update local cache
      localCache.deviceCredits.set(deviceId, false);
      
      return false;
    };
    
    return await Promise.race([firestorePromise(), timeoutPromise]);
  } catch (error) {
    console.error('Error checking device credits usage:', error);
    return false;
  }
};

// Auth helpers with improved resilience
export const onAuthStateChanged = firebaseOnAuthStateChanged;

// Define a proper return type interface for signInAnonymously
interface AuthResult {
  user?: {
    uid?: string;
    isAnonymous?: boolean;
  };
}

export const signInAnonymously = (): Promise<AuthResult> => {
  console.log('Attempting anonymous sign in');
  
  // Create a timeout promise
  const timeoutPromise = new Promise<AuthResult>((_, reject) => {
    setTimeout(() => reject(new Error('Auth operation timeout')), FIREBASE_OPERATION_TIMEOUT);
  });
  
  // Create the auth operation promise
  const authPromise = firebaseSignInAnonymously(auth)
    .then(result => {
      console.log('Anonymous sign in successful, UID:', result.user?.uid);
      return result as AuthResult;
    })
    .catch(error => {
      console.error('Anonymous sign in failed:', error);
      throw error;
    });
  
  // Race between the auth operation and the timeout
  return Promise.race([authPromise, timeoutPromise]);
};

// Export all services and functions
export { 
  app, 
  auth, 
  db, 
  storage,
  functions,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  runTransaction,
  increment,
  storageRef,
  uploadString,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  httpsCallable
};

// Extended auth functions
export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logOut = () => {
  return signOut(auth);
};

export const getFirestore = () => db;
export const getStorage = () => storage;

// Re-export User type
export type { User };

// Export default for compatibility
export default {
  app,
  auth,
  db,
  storage,
  functions,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  runTransaction,
  increment,
  storageRef,
  uploadString,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  httpsCallable,
  onAuthStateChanged: firebaseOnAuthStateChanged,
  signInAnonymously: () => firebaseSignInAnonymously(auth),
  createUser: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
  signIn: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  signInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
  resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
  logOut: () => signOut(auth),
  getFirestore: () => db,
  getStorage: () => storage
}; 