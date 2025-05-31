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
  collection
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
  collection 
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
  onAuthStateChanged: firebaseOnAuthStateChanged,
  signInAnonymously: () => firebaseSignInAnonymously(auth),
  getFirestore: () => db
}; 