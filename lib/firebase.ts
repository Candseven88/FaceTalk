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

// Initialize Firebase services
const auth = getAuth(app);
const db = firebaseGetFirestore(app);
const storage = firebaseGetStorage(app);
const functions = getFunctions(app);

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

// 保存用户反馈
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

// 处理用户订阅
export const processSubscription = async (userId: string, plan: string) => {
  try {
    // 确定积分和等级
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
    
    // 更新用户文档
    const userRef = doc(db, 'userPlans', userId);
    
    await runTransaction(db, async (transaction) => {
      // 获取当前用户数据
      const userDoc = await transaction.get(userRef);
      
      // 准备更新数据
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
      
      // 如果用户文档已存在，保留现有字段
      if (userDoc.exists()) {
        transaction.update(userRef, userData);
      } else {
        transaction.set(userRef, {
          ...userData,
          usedPoints: 0,
          createdAt: serverTimestamp()
        });
      }
      
      // 记录交易
      const transactionRef = doc(collection(db, 'transactions'));
      transaction.set(transactionRef, {
        userId,
        type: 'subscription',
        plan,
        credits,
        amount: plan === 'basic' ? 5 : 15,
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

// 升级匿名用户为正式账户
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

// 记录设备的免费积分使用情况
export const recordDeviceCreditsUsage = async (deviceId: string) => {
  try {
    const deviceRef = doc(db, 'deviceCredits', deviceId);
    
    // 检查设备记录是否存在
    const deviceDoc = await getDoc(deviceRef);
    
    if (deviceDoc.exists()) {
      // 更新现有记录
      await updateDoc(deviceRef, {
        hasUsedFreeCredits: true,
        lastUpdated: serverTimestamp()
      });
    } else {
      // 创建新记录
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

// 检查设备是否已使用过免费积分
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