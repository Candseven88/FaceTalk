# Replicate Model Integration Guide

This document outlines the implementation details for integrating with Replicate's AI models, based on analysis of a working Next.js project.

## Critical Implementation Logic

### 1. API Call Construction

**File: `app/api/generate-animation/route.ts`**
- **Endpoint**: `https://api.replicate.com/v1/predictions` 
- **Headers**:
  ```typescript
  {
    'Content-Type': 'application/json',
    'Authorization': `Token ${apiToken}` // apiToken from process.env.REPLICATE_API_TOKEN
  }
  ```
- **Payload**:
  ```typescript
  {
    version: "a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b", // Model version
    input: {
      image, // Base64-encoded portrait image
      video  // Base64-encoded driving video
    }
  }
  ```

### 2. Model Prediction Triggering and Status Checking

**File: `app/page.tsx`**
- The frontend converts files to base64 using the `fileToBase64` utility function
- Sends a POST request to the Next.js API route `/api/generate-animation`
- After receiving a prediction ID, it polls the status using a recursive function

**File: `app/api/check-prediction/route.ts`**
- Makes GET requests to `https://api.replicate.com/v1/predictions/${id}`
- Continues polling with a 3-second delay until the status is "succeeded" or "failed"

### 3. CORS Handling

CORS issues are handled by using Next.js API routes as a proxy:
- Frontend never directly calls the Replicate API
- All API calls are made from the server-side Next.js API routes
- This eliminates CORS issues as the browser only communicates with the same origin

### 4. Video URL Retrieval and Display

**File: `app/page.tsx`**
- When polling detects a "succeeded" status, it retrieves the output URL from the prediction response
- Sets the video result URL in state: `setVideoResult(result.output)`
- The video is displayed in the UI using a standard video element

### 5. Optimizations and Simplified Logic

1. **File Size Validation**:
   - Frontend validates file sizes before uploading (max 5MB)
   - API routes have a 10MB limit as an additional safeguard

2. **Base64 Conversion**:
   - Files are converted to base64 on the client side using `FileReader`
   - This eliminates the need for multipart form uploads or server-side file handling

3. **Recursive Polling**:
   - Uses a simple recursive function with setTimeout for polling
   - Provides real-time status updates to the user

4. **Error Handling**:
   - Comprehensive error handling at both frontend and API levels
   - Detailed error messages are passed back to the user

## Reusable Functions and Utilities

1. **File to Base64 Conversion**:
   ```typescript
   const fileToBase64 = (file: File): Promise<string> => {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.readAsDataURL(file);
       reader.onload = () => {
         if (typeof reader.result === 'string') {
           resolve(reader.result);
         } else {
           reject(new Error('Failed to convert file to base64'));
         }
       };
       reader.onerror = error => reject(error);
     });
   };
   ```

2. **Prediction Polling Function**:
   ```typescript
   const pollPrediction = async (id: string): Promise<PredictionResponse> => {
     const response = await fetch(`/api/check-prediction?id=${id}`);
     
     if (!response.ok) {
       throw new Error(`Polling failed: ${response.statusText}`);
     }
     
     const prediction: PredictionResponse = await response.json();
     
     if (prediction.status === 'succeeded') {
       return prediction;
     } else if (prediction.status === 'failed') {
       throw new Error(prediction.error || 'Processing failed');
     }
     
     // Continue polling
     setProgress(`Processing (status: ${prediction.status})...`);
     await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
     return pollPrediction(id);
   };
   ```

## Key Files for Replication

1. **API Routes**:
   - `app/api/generate-animation/route.ts` - Initiates the prediction
   - `app/api/check-prediction/route.ts` - Checks prediction status

2. **Frontend**:
   - `app/page.tsx` - Contains the UI and integration logic

3. **Environment Variables**:
   - `REPLICATE_API_TOKEN` - Required for authentication with Replicate API

## Implementation Steps for a New Project

1. Set up a similar Next.js project structure
2. Create the same API routes for proxying requests to Replicate
3. Implement the file conversion and polling logic
4. Configure the appropriate environment variables
5. Update the model version and input parameters to match your chosen model
