// Firebase real implementation
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  signInAnonymously as firebaseSignInAnonymously,
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
  getDocs
} from 'firebase/firestore';

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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '已设置' : '未设置',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '已设置' : '未设置',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '已设置' : '未设置',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '已设置' : '未设置',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '已设置' : '未设置',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '已设置' : '未设置',
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

const auth = getAuth(app);
const db = firebaseGetFirestore(app);

console.log('Firebase auth and db setup complete');

// 添加生成记录到Firestore
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

// 获取用户的生成历史
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

// 更新用户计划的使用情况
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

// Export Firebase services with the same interface as the mock
export { 
  app, 
  auth, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp, 
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
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
export const getFirestore = () => db;

// Re-export User type
export type { User };

// Export default for compatibility
export default {
  app,
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onAuthStateChanged: firebaseOnAuthStateChanged,
  signInAnonymously: () => firebaseSignInAnonymously(auth),
  getFirestore: () => db
}; 