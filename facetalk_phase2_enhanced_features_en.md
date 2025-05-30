# 🧩 FaceTalk Project – Phase 2: Enhanced Functionalities

## 🔐 User System
- Use Firebase Anonymous Login
- Assign each user a unique ID and credit balance
- Store in Firestore: `users/{uid}/credits` and `users/{uid}/usageLogs`

## 💳 Credit System
Each model call deducts credits from the user account:
- Live Portrait (2 credits)
- Voice Clone (1 credit)
- Talking Portrait (3 credits)
Credits must be deducted only after confirming Replicate API call was successful.

## 💰 Subscription Tiers (via Creem or Stripe)
| Plan       | Price    | Monthly Credits | Notes              |
|------------|----------|------------------|---------------------|
| Free Trial | $0       | 2 credits        | One-time use, watermark |
| Basic      | $5/mo    | 10 credits       | For casual users     |
| Pro        | $15/mo   | 50 credits       | Priority access      |
| Enterprise | $49/mo   | 200 credits      | Custom branding / support |

## 📈 Usage Logging
- Log all model usage to Firestore:
  - uid, timestamp, model used, credits consumed, result link
- Required for analytics and abuse tracking

## 💬 User Feedback
- Include a "Feedback" button on every page
- Can use embedded Google Form or self-built form

## ⚙️ Technical Notes
- Disable action buttons if user has insufficient credits
- Show remaining credits at the top of the UI
- Route all model requests through secure backend functions
- NEVER expose any API key in client-side code