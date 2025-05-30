# FaceTalk: Complete Technical Documentation

*Document Date: May 27, 2024*

This document provides a detailed technical overview of all three AI features in the FaceTalk application, including implementation details, data flow, and usage instructions.

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Live Portrait Animation](#live-portrait-animation)
3. [Voice Cloning](#voice-cloning)
4. [Talking Portrait](#talking-portrait)
5. [Common Infrastructure](#common-infrastructure)
6. [Security & Best Practices](#security--best-practices)

## Project Architecture

The FaceTalk application uses a modern web architecture built with:

- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes as serverless functions
- **External API**: Replicate AI API for model inference

The application follows a modular architecture with:

- Each AI feature implemented as a standalone React component
- Dedicated API routes for each Replicate model
- Shared utilities for common functionality
- Centralized tab-based navigation in the main application

## Live Portrait Animation

### Feature Overview

This feature animates a static portrait image using motion from a driving video, creating a realistic animation where the person in the portrait mimics the movements in the video.

- **Model**: `zf-kbot/live-portrait`
- **Version ID**: `a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b`
- **Credit Usage**: 2 credits per use

### Implementation Details

#### Frontend Component: `LivePortrait.tsx`

The component handles:
- File upload UI for portrait image and driving video
- File validation and preview
- API calls to the backend
- Progress monitoring
- Result display

#### Backend API Route: `app/api/generate-animation/route.ts`

This route:
- Validates the request
- Calls the Replicate API with the image and video
- Returns the prediction ID for polling

#### Example Input

```json
{
  "image": "[base64-encoded-image]",
  "video": "[base64-encoded-video]"
}
```

#### Example Output

```json
{
  "id": "prediction-id",
  "status": "succeeded",
  "output": "https://replicate.delivery/output-url/animated-video.mp4"
}
```

## Voice Cloning

### Feature Overview

This feature clones a voice from a sample audio file and generates new speech in that voice using provided text.

- **Model**: `kjjk10/llasa-3b-long`
- **Version ID**: `0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e`
- **Credit Usage**: 1 credit per use

### Implementation Details

#### Frontend Component: `VoiceCloning.tsx`

The component handles:
- Audio sample upload
- Text input for cloning
- Optional prompt text and chunk length configuration
- API calls to the backend
- Progress monitoring
- Audio result playback and download

#### Backend API Route: `app/api/voice-clone/route.ts`

This route:
- Validates the request
- Calls the Replicate API with the voice sample and text
- Returns the prediction ID for polling

#### Example Input

```json
{
  "text": "This is the text that will be spoken in the cloned voice.",
  "prompt_text": "Optional prompt to guide the voice generation.",
  "chunk_length": 250,
  "voice_sample": "[base64-encoded-audio]"
}
```

#### Example Output

```json
{
  "id": "prediction-id",
  "status": "succeeded",
  "output": "https://replicate.delivery/output-url/cloned-voice.wav"
}
```

## Talking Portrait

### Feature Overview

This feature combines a portrait image with an audio file to create a video of the portrait speaking or singing with realistic lip and facial movements.

- **Model**: `zsxkib/sonic`
- **Version ID**: `a2aad29ea95f19747a5ea22ab14fc6594654506e5815f7f5ba4293e888d3e20f`
- **Credit Usage**: 3 credits per use

### Implementation Details

#### Frontend Component: `TalkingPortrait.tsx`

The component handles:
- Portrait image upload
- Audio file upload
- Advanced configuration settings
- API calls to the backend
- Progress monitoring
- Video result playback and download

#### Backend API Route: `app/api/talking-portrait/route.ts`

This route:
- Validates the request
- Calls the Replicate API with the image, audio, and parameters
- Returns the prediction ID for polling

#### Example Input

```json
{
  "seed": 42,
  "audio": "[base64-encoded-audio]",
  "image": "[base64-encoded-image]",
  "dynamic_scale": 1,
  "min_resolution": 512,
  "inference_steps": 25,
  "keep_resolution": false
}
```

#### Example Output

```json
{
  "id": "prediction-id",
  "status": "succeeded",
  "output": "https://replicate.delivery/output-url/talking-portrait.mp4"
}
```

## Common Infrastructure

### Shared API Route: `app/api/check-prediction/route.ts`

This route is used by all features to check the status of a prediction. It:
- Takes a prediction ID as a query parameter
- Calls the Replicate API to check the status
- Returns the current status and output if available

### Utilities: `app/utils.ts`

Contains shared utility functions used across all features:
- `fileToBase64`: Converts files to base64 for API submissions
- `validateFileSize`: Checks if files meet size constraints
- `pollPrediction`: Recursively polls a prediction until completion

### Environment Validation: `app/components/EnvChecker.tsx` and `app/api/check-env/route.ts`

These components work together to:
- Verify that the Replicate API token is correctly configured
- Test the connection to Replicate API
- Display troubleshooting information if needed

## Security & Best Practices

### API Token Security

1. **Environment Variables**:
   - Replicate API token stored in `.env.local`
   - Never exposed to the client-side

2. **Server-side API Calls**:
   - All API calls to Replicate are made from Next.js API routes
   - Client never directly interacts with Replicate API

3. **Token Validation**:
   - Format checking (must start with "r8_")
   - Presence checking before making API calls

### File Handling

1. **Size Limits**:
   - 5MB maximum file size for all uploads
   - Client-side validation before upload

2. **Type Validation**:
   - Image files for portraits
   - Video files for driving videos
   - Audio files for voice samples

3. **Client-side Processing**:
   - Files converted to base64 on the client
   - No server-side storage of uploaded files

### Error Handling

1. **Comprehensive Error States**:
   - Validation errors
   - API errors
   - Processing errors

2. **User Feedback**:
   - Clear error messages
   - Progress indicators
   - Status updates during processing

---

This technical documentation provides a comprehensive overview of all three features in the FaceTalk application, including implementation details, data flow, and security considerations. 