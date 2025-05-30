# Environment Variables for FaceTalk

This document lists the environment variables required for the FaceTalk application.

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Creem.io Payment Links
NEXT_PUBLIC_CREEM_BASIC_LINK=https://www.creem.io/payment/your_basic_product_id
NEXT_PUBLIC_CREEM_PRO_LINK=https://www.creem.io/payment/your_pro_product_id

# Replicate API (for AI features)
REPLICATE_API_TOKEN=your_replicate_api_token
```

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Anonymous Authentication in the Firebase console
3. Create a Firestore database and set up the following security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own user plan
    match /userPlans/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Only allow writes from server
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Creem.io Setup

1. Sign up for a Creem.io account
2. Create two products:
   - Basic Plan ($5/month)
   - Pro Plan ($15/month)
3. Copy the payment links for each product and add them to your environment variables

## Replicate API Setup

1. Sign up for a Replicate account at [https://replicate.com/](https://replicate.com/)
2. Get your API token from your account settings
3. Add the API token to your environment variables 