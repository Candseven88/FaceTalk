# FaceTalk Project Structure

## API Routes
- `/api/generate-animation` - Initiates the Live Portrait Animation prediction
- `/api/voice-clone` - Initiates the Voice Cloning prediction
- `/api/talking-portrait` - Initiates the Talking Portrait prediction
- `/api/check-prediction` - Polls prediction status for all models
- `/api/check-env` - Verifies environment setup

## Components
- `LivePortrait.tsx` - UI for Live Portrait Animation feature
- `VoiceCloning.tsx` - UI for Voice Cloning feature
- `TalkingPortrait.tsx` - UI for Talking Portrait feature
- `EnvChecker.tsx` - Environment variables validator

## Core Files
- `utils.ts` - Utility functions for file handling and polling
- `types.ts` - TypeScript interfaces for the application
- `page.tsx` - Main application page with tab navigation
- `layout.tsx` - Root layout for the application

## Features

### Live Portrait Animation
- **Model**: `zf-kbot/live-portrait`
- **Version ID**: `a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b`
- Upload a portrait image
- Upload a driving video
- Generate an animated portrait
- View and download the result

### Voice Cloning
- **Model**: `kjjk10/llasa-3b-long`
- **Version ID**: `0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e`
- Upload a voice sample
- Provide text input and optional prompt text
- Adjust chunk length parameter
- Generate cloned voice audio
- View and download the result

### Talking Portrait
- **Model**: `zsxkib/sonic`
- **Version ID**: `a2aad29ea95f19747a5ea22ab14fc6594654506e5815f7f5ba4293e888d3e20f`
- Upload a portrait image
- Upload an audio file
- Configure advanced parameters (seed, dynamic scale, etc.)
- Generate a talking avatar video
- View and download the result

## Implementation Details
- All API calls to Replicate are proxied through Next.js API routes
- Files are converted to base64 on the client side before sending
- Prediction status is polled until completion
- Results are displayed with proper error handling
- Download options for generated media
- Secure token handling through environment variables 