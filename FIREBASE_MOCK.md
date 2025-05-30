# Firebase Mock Implementation

Due to issues with installing and importing the Firebase SDK in the current environment, we've implemented a mock version of Firebase authentication for development purposes.

## Implementation Details

The mock implementation provides the same API as the real Firebase SDK, but with simplified functionality:

### User Authentication

- Anonymous authentication is simulated with randomly generated UIDs
- User sessions are persisted in localStorage
- Auth state changes are handled with setTimeout to simulate asynchronous behavior

### Firebase Services

- Basic app, auth, and db objects are provided
- Firestore operations like collection and document access are mocked
- All operations return predictable results

## Usage

The mock implementation is used exactly like the real Firebase SDK:

```typescript
import { signInAnonymousUser, onAuthChange, User } from './lib/firebase';

// Sign in anonymously
const uid = await signInAnonymousUser();

// Listen for auth state changes
const unsubscribe = onAuthChange((user: User | null) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

// Unsubscribe when no longer needed
unsubscribe();
```

## Upgrading to Real Firebase

When the environment issues are resolved, the mock implementation can be replaced with the real Firebase SDK:

1. Install Firebase: `npm install firebase`
2. Replace the mock implementation with the real one
3. Configure Firebase with your project credentials

The rest of the application code will continue to work without changes since the API is the same. 