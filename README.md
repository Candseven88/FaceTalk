# FaceTalk Pro

FaceTalk Pro is a credit-based AI application that generates talking portraits using voice cloning, photo animation, and synchronized video generation technologies.

## 🚀 Features

- **Voice Cloning**: Generate natural speech in your voice
- **Portrait Animation**: Bring still photos to life
- **Talking Videos**: Create synchronized talking head videos
- **Credit System**: Pay-per-use model with flexible credit packs
- **Secure Processing**: All data handled through encrypted channels

## 🛠 Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/facetalk-pro.git
cd facetalk-pro
```

2. Create a `.env` file in the root directory with your credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_REPLICATE_API_KEY=your_replicate_api_key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

## 🔒 Security

- **Environment Variables**: All sensitive keys are stored in `.env`
- **Firebase Config**: Loaded through `firebase-config.js` (not committed)
- **API Security**: 
  - Rate limiting implemented
  - CORS policies configured
  - Request validation in place
- **Data Protection**:
  - All uploads processed through secure channels
  - Temporary files automatically cleaned up
  - User data encrypted at rest

## 🏗 Project Structure

```
facetalk-pro/
├── assets/           # Static assets (images, audio)
├── components/       # Reusable UI components
├── firebase-config.js# Firebase initialization
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── vercel.json      # Vercel deployment config
├── index.html       # Main entry point
├── credits.js       # Credit system logic
└── README.md        # Project documentation
```

## 🚀 Deployment

The app is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with `vercel --prod`

## 🔐 Security Best Practices

1. Never commit sensitive files:
   - `.env`
   - `firebase-config.js`
   - API keys
   - Private certificates

2. Use environment variables for:
   - API keys
   - Service credentials
   - Configuration settings

3. Implement security headers:
   - CSP (Content Security Policy)
   - CORS policies
   - XSS protection
   - Frame options

## 📝 License

Copyright © 2024 FaceTalk Pro. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support inquiries, please email support@facetalk-pro.com 