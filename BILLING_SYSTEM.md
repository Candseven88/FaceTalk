# FaceTalk Billing System

This document explains how the billing and usage system works in FaceTalk.

## Authentication

- FaceTalk uses Firebase Anonymous Authentication to identify users without requiring them to create an account.
- Users are automatically signed in anonymously when they first visit the app.
- The user's UID is stored in localStorage for persistence across sessions.

## Plans and Pricing

FaceTalk offers three subscription tiers:

1. **Free Trial**
   - Default for all new users
   - Limited to 1 generation per day
   - Usage is tracked via localStorage

2. **Basic Plan ($5/month)**
   - 20 total generations per month
   - No daily limits
   - Usage tracked in Firestore

3. **Pro Plan ($15/month)**
   - 50 total generations per month
   - No daily limits
   - Usage tracked in Firestore

## Usage Tracking

### Free Users
- Free users can use any feature once per day
- Usage is tracked using `localStorage.setItem("hasUsedToday", true)` and a date check
- When a user attempts to use a feature, the system checks if they've already used their daily quota
- If they have, a modal is shown prompting them to upgrade

### Paid Users
- Paid users have a monthly quota of animations (10 for Basic, 50 for Pro)
- Each time they use a feature, the `animationsLeft` count is decreased by 1
- This count is stored in Firestore in the `userPlans/{uid}` document
- When a user runs out of animations, they're prompted to upgrade their plan

## Payment Processing

1. Users can upgrade their plan on the `/pricing` page
2. Payment is processed through Creem.io
3. After successful payment, users are redirected to `/payment-success?plan=basic` or `/payment-success?plan=pro`
4. The success page updates the user's plan in Firestore and sets their animation count

## Implementation Details

### Key Files

- `lib/firebase.ts` - Firebase initialization and auth helpers
- `lib/AuthContext.tsx` - React context for authentication
- `lib/useAuth.ts` - Custom hook for auth and plan usage
- `lib/userPlans.ts` - Functions for managing user plans
- `app/pricing/page.tsx` - Pricing page with subscription options
- `app/payment-success/page.tsx` - Payment success handler
- `app/components/SubscriptionModal.tsx` - Modal shown when usage limits are reached
- `app/components/LivePortrait.tsx` - Example component using the usage system

### Usage Flow

1. User visits the app and is automatically signed in anonymously
2. The `useAuth` hook provides authentication and plan information
3. When a user tries to use a feature, the component calls `checkUsageAllowed()`
4. If allowed, the feature is used and `useOneCredit()` is called to track usage
5. If not allowed, a subscription modal is shown

## Testing the System

1. Free users: Use the app, then refresh and try to use it again - you should see the "Free Trial Limit Reached" modal
2. Paid users: After subscribing, you should see your remaining animations count, which decreases with each use 