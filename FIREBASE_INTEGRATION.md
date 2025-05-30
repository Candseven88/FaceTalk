# Firebase Integration in FaceTalk

This document explains how Firebase anonymous authentication has been integrated into the FaceTalk application.

## Overview

FaceTalk uses Firebase anonymous authentication to:
- Assign a unique user ID (UID) to each visitor
- Track usage and generation history
- Manage user data without requiring signup

## Implementation Details

### 1. Firebase Initialization

Firebase is initialized in `lib/firebase.ts` using environment variables from `.env.local`:

```typescript
// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### 2. Anonymous Authentication

The application uses Firebase's anonymous authentication to create a unique ID for each user:

```typescript
export const signInAnonymousUser = async (): Promise<string | null> => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }
};
```

### 3. Auth Context Provider

A React context provider (`lib/AuthContext.tsx`) manages the authentication state:
- Automatically signs in users anonymously on first visit
- Stores the UID in localStorage for persistence
- Provides authentication state to all components

### 4. User Session Flow

1. When a user first visits FaceTalk, the AuthProvider checks for a stored UID in localStorage
2. If no UID is found, the user is signed in anonymously
3. The UID is stored in localStorage for future visits
4. The UserInfo component displays the user's ID (first 8 characters)

## Security Considerations

- Firebase configuration is accessed only through environment variables
- No sensitive information is stored in client-side code
- UIDs are unique and cannot be manipulated by users

## Future Enhancements

This anonymous authentication lays the groundwork for:
- Usage tracking and limits
- Saving generation history
- Upgrading to email/password or social authentication
- Implementing premium features and subscription management

## Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
``` 