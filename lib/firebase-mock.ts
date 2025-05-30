// Firebase Mock Implementation
// This is a simplified mock of Firebase for development and deployment
// when actual Firebase configuration is not available

export type User = {
  uid: string;
  isAnonymous: boolean;
};

export type Timestamp = {
  toDate: () => Date;
};

// Mock Firestore
export const doc = () => ({});
export const getDoc = async () => ({
  exists: () => true,
  data: () => ({
    plan: 'free',
    pointsLeft: 3,
    startDate: {
      toDate: () => new Date()
    }
  })
});
export const setDoc = async () => {};
export const updateDoc = async () => {};
export const onSnapshot = () => () => {};
export const getFirestore = () => ({});
export const Timestamp = {
  now: () => ({
    toDate: () => new Date()
  })
};

// Mock Auth
export const getAuth = () => ({
  currentUser: null
});
export const onAuthStateChanged = (auth: any, callback: (user: User | null) => void) => {
  // Simulate a logged-in user
  setTimeout(() => {
    callback({
      uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
      isAnonymous: true
    });
  }, 100);
  
  return () => {}; // Unsubscribe function
};
export const signInAnonymously = async () => {
  return {
    user: {
      uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
      isAnonymous: true
    }
  };
};

// Mock Firebase app
export const initializeApp = () => ({});

// Export all mock functions
export default {
  initializeApp,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp
}; 