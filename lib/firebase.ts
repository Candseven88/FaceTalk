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
  increment
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

// Initialize Firebase
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Firebase initialization failed');
}

// Initialize Firebase services
const auth = getAuth(app);
const db = firebaseGetFirestore(app);
const storage = firebaseGetStorage(app);
const functions = getFunctions(app);

console.log('Firebase auth and db setup complete');

// Add generation record to Firestore
export const saveGeneration = async (userId: string, type: string, result: string, cost: number) => {
  try {
    const generationData = {
      userId,
      type,
      result,
      timestamp: Timestamp.now(),
      cost
    };
    
    const docRef = await addDoc(collection(db, 'generations'), generationData);
    console.log('Generation saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving generation to Firestore:', error);
    return null;
  }
};

// Get user generation history
export const getUserGenerations = async (userId: string, maxResults = 10) => {
  try {
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
    
    console.log(`Retrieved ${generations.length} generations for user ${userId}`);
    return generations;
  } catch (error) {
    console.error('Error getting user generations:', error);
    return [];
  }
};

// Update user plan usage stats
export const updateUsageStats = async (userId: string, pointsUsed: number) => {
  try {
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
      
      console.log(`Updated usage stats for ${userId}: ${pointsUsed} points used, ${newPointsLeft} remaining`);
      return true;
    }
    
    console.log(`User plan not found for ${userId}, cannot update usage stats`);
    return false;
  } catch (error) {
    console.error('Error updating usage stats:', error);
    return false;
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

// Record device free credits usage
export const recordDeviceCreditsUsage = async (deviceId: string) => {
  try {
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
  } catch (error) {
    console.error('Error recording device credits usage:', error);
    return false;
  }
};

// Check if device has already used free credits
export const checkDeviceCreditsUsage = async (deviceId: string): Promise<boolean> => {
  try {
    const deviceRef = doc(db, 'deviceCredits', deviceId);
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      const deviceData = deviceDoc.data();
      return deviceData.hasUsedFreeCredits === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking device credits usage:', error);
    return false;
  }
};

// Export Firebase services with the same interface as the mock
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

// Auth helpers
export const onAuthStateChanged = firebaseOnAuthStateChanged;
export const signInAnonymously = () => {
  console.log('Attempting anonymous sign in');
  return firebaseSignInAnonymously(auth)
    .then(result => {
      console.log('Anonymous sign in successful, UID:', result.user?.uid);
      return result;
    })
    .catch(error => {
      console.error('Anonymous sign in failed:', error);
      throw error;
    });
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