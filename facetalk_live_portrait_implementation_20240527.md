# FaceTalk: Live Portrait Animation - Technical Implementation

*Document Date: May 27, 2024*

This document provides a detailed technical overview of the Live Portrait Animation module in the FaceTalk application, which utilizes the Replicate API to generate animated portraits from a static image and a driving video.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend API Routes](#backend-api-routes)
4. [Data Flow & Processing](#data-flow--processing)
5. [Error Handling & Loading States](#error-handling--loading-states)
6. [Security & Best Practices](#security--best-practices)
7. [Optimization Techniques](#optimization-techniques)

## Project Structure

The Live Portrait Animation module is structured as follows:

```
app/
├── components/
│   ├── LivePortrait.tsx     # Main component for portrait animation
│   └── EnvChecker.tsx       # Environment variable validator
├── api/
│   ├── generate-animation/  # API route to initiate prediction
│   │   └── route.ts
│   ├── check-prediction/    # API route to poll prediction status
│   │   └── route.ts
│   └── check-env/           # API route to verify environment setup
│       └── route.ts
├── utils.ts                 # Utility functions (file conversion, etc.)
├── types.ts                 # TypeScript interfaces
├── page.tsx                 # Main application page with tabs
└── layout.tsx               # Root layout
```

## Frontend Implementation

### Main Component: LivePortrait.tsx

The LivePortrait component handles the user interface for uploading a portrait image and driving video, submitting them to the Replicate API, and displaying the resulting animation.

#### State Management

```typescript
// State variables for file handling, processing, and results
const [portraitFile, setPortraitFile] = useState<File | null>(null);
const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
const [drivingFile, setDrivingFile] = useState<File | null>(null);
const [drivingPreview, setDrivingPreview] = useState<string | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [progress, setProgress] = useState<string>('');
const [videoResult, setVideoResult] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
```

#### File Upload Handlers

The component implements separate handlers for portrait images and driving videos:

```typescript
// Handle portrait image selection
const handlePortraitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    if (!validateFileSize(file)) {
      setError('Portrait image must be less than 5MB');
      return;
    }
    
    setPortraitFile(file);
    try {
      const base64 = await fileToBase64(file);
      setPortraitPreview(base64);
      setError(null);
    } catch (err) {
      setError('Failed to process portrait image');
      console.error(err);
    }
  }
};

// Handle driving video selection
const handleDrivingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    if (!validateFileSize(file)) {
      setError('Driving video must be less than 5MB');
      return;
    }
    
    setDrivingFile(file);
    try {
      const base64 = await fileToBase64(file);
      setDrivingPreview(base64);
      setError(null);
    } catch (err) {
      setError('Failed to process driving video');
      console.error(err);
    }
  }
};
```

#### Animation Generation Process

The `handleGenerate` function orchestrates the entire animation generation workflow:

```typescript
// Generate animation
const handleGenerate = async () => {
  if (!portraitFile || !drivingFile) {
    setError('Both portrait image and driving video are required');
    return;
  }

  setIsProcessing(true);
  setProgress('Initializing...');
  setError(null);
  setVideoResult(null);

  try {
    // Convert files to base64
    const portraitBase64 = await fileToBase64(portraitFile);
    const drivingBase64 = await fileToBase64(drivingFile);

    // Initiate prediction
    const response = await fetch('/api/generate-animation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: portraitBase64,
        video: drivingBase64
      }),
    });

    // Handle server errors
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate animation');
    }

    setProgress('Processing...');

    // Poll for prediction results
    const result = await pollPrediction(data.id, setProgress);
    
    // Handle successful prediction
    if (result.output) {
      const outputUrl = Array.isArray(result.output) 
        ? result.output[0] 
        : result.output;
      setVideoResult(outputUrl);
    } else {
      throw new Error('No output generated');
    }
  } catch (err: any) {
    console.error('Animation error:', err);
    setError(err.message || 'Failed to generate animation');
  } finally {
    setIsProcessing(false);
  }
};
```

#### UI Structure

The UI is structured with:
- File upload zones with previews
- Action buttons (Generate Animation, Reset)
- Progress indicators
- Error message display
- Result video player with download option

```tsx
return (
  <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold mb-6">Live Portrait Animation</h2>
    
    {/* Input Section with grid layout */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Portrait Image Upload */}
      <div className="space-y-2">
        {/* ... portrait upload UI ... */}
      </div>

      {/* Driving Video Upload */}
      <div className="space-y-2">
        {/* ... driving video upload UI ... */}
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-wrap gap-4 mb-6">
      {/* ... Generate Animation and Reset buttons ... */}
    </div>

    {/* Progress Display */}
    {progress && (
      <div className="mb-6">
        {/* ... progress bar and status ... */}
      </div>
    )}

    {/* Error Message */}
    {error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )}

    {/* Result Video */}
    {videoResult && (
      <div className="mt-8">
        {/* ... video player and download button ... */}
      </div>
    )}
  </div>
);
```

## Backend API Routes

### File to Base64 Conversion

The utility function in `utils.ts` handles file conversion:

```typescript
/**
 * Converts a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
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

### Generate Animation API Route

The `app/api/generate-animation/route.ts` file handles the initial request to the Replicate API:

```typescript
export async function POST(request: NextRequest) {
  // Get API token from environment variables
  const apiToken = process.env.REPLICATE_API_TOKEN || '';
  
  // Validate token format
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Replicate API token is missing.' },
      { status: 500 }
    );
  }
  
  if (!apiToken.startsWith('r8_')) {
    return NextResponse.json(
      { error: 'Invalid Replicate API token format.' },
      { status: 500 }
    );
  }

  try {
    // Extract image and video from request
    const { image, video } = await request.json();

    if (!image || !video) {
      return NextResponse.json(
        { error: 'Both image and video inputs are required' },
        { status: 400 }
      );
    }

    // Call Replicate API to initiate prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`
      },
      body: JSON.stringify({
        version: "a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b", // Live Portrait model version
        input: {
          image,
          video
        }
      })
    });

    // Handle API response
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to initiate prediction' },
        { status: response.status }
      );
    }

    // Return prediction ID and details
    const prediction = await response.json();
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error('Error generating animation:', error);
    return NextResponse.json(
      { error: 'Failed to process animation request' },
      { status: 500 }
    );
  }
}
```

### Check Prediction API Route

The `app/api/check-prediction/route.ts` file handles polling the Replicate API for prediction status:

```typescript
export async function GET(request: NextRequest) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Replicate API token is missing' },
      { status: 500 }
    );
  }

  try {
    // Extract prediction ID from query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Check prediction status
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`
      }
    });

    // Handle API response
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Failed to check prediction status' },
        { status: response.status }
      );
    }

    // Return current prediction status
    const prediction = await response.json();
    return NextResponse.json(prediction);
    
  } catch (error) {
    console.error('Error checking prediction:', error);
    return NextResponse.json(
      { error: 'Failed to check prediction status' },
      { status: 500 }
    );
  }
}
```

## Data Flow & Processing

### File Processing Workflow

1. **User Uploads Files**:
   - Portrait image (JPG, PNG, WEBP) and driving video (MP4, MOV, WEBM) are uploaded through the file input UI
   - Files are validated for size and type
   - Preview is displayed for both files

2. **Base64 Conversion**:
   - Files are converted to base64 strings on the client side
   - This eliminates the need for multipart form uploads

3. **API Submission**:
   - Base64 data is sent to the Next.js API route
   - API route proxies the request to Replicate

4. **Prediction Status Polling**:
   - After receiving a prediction ID, the frontend polls for status updates
   - Polling continues until the prediction succeeds or fails
   - Status updates are displayed to the user

5. **Result Retrieval**:
   - Once processing is complete, the output URL is extracted from the prediction
   - Video is displayed to the user with a download option

### Polling Implementation

```typescript
export const pollPrediction = async (
  id: string, 
  onProgress?: (status: string) => void
): Promise<PredictionResponse> => {
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
  if (onProgress) {
    onProgress(`Processing (status: ${prediction.status})...`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
  return pollPrediction(id, onProgress);
};
```

## Error Handling & Loading States

### Error Handling

The application implements multiple layers of error handling:

1. **Client-side Validation**:
   - File type and size validation before upload
   - Required field checks before submission

2. **API Route Error Handling**:
   - Try/catch blocks for all API operations
   - Proper error status codes and messages

3. **UI Error Display**:
   - Error messages shown to the user
   - Detailed troubleshooting information when needed

### Loading States

The UI provides feedback during processing:

1. **Button States**:
   - Generate button is disabled when:
     - Files are not yet uploaded
     - Processing is in progress
   - Reset button is disabled during processing

2. **Progress Indicators**:
   - Animated progress bar during processing
   - Status messages indicating current processing step

3. **Processing States**:
   - Status changes from "Initializing..." to "Processing..."
   - Real-time status updates from the Replicate API

## Security & Best Practices

### API Token Security

1. **Environment Variables**:
   - Replicate API token stored in `.env.local`
   - Never exposed to the client

2. **Server-side API Calls**:
   - All API calls to Replicate are made from Next.js API routes
   - Client never directly interacts with Replicate API

3. **Token Validation**:
   - Format checking (must start with "r8_")
   - Presence checking before making API calls

### Environment Validation

The application includes an environment checker component that:
- Verifies token existence and format
- Tests connection to Replicate API
- Provides troubleshooting guidance if issues are found

```typescript
// EnvChecker.tsx (simplified)
export default function EnvChecker() {
  const [tokenStatus, setTokenStatus] = useState<string>('Checking...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch('/api/check-env');
        const data: EnvCheckResult = await response.json();
        
        if (data.tokenAvailable && 
            data.tokenFormat?.startsWithR8 && 
            data.connectionTest.status === 'success') {
          setTokenStatus('✅ Replicate API token is properly configured');
        } else {
          // Handle error cases
          // ...
        }
      } catch (error) {
        // Handle fetch errors
        // ...
      }
    };
    
    checkToken();
  }, []);
  
  // Component rendering logic
  // ...
}
```

## Optimization Techniques

### File Size Limits

The application enforces a 5MB limit on both image and video files:

```typescript
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};
```

### Caching Prevention

API routes use the `force-dynamic` export to prevent caching:

```typescript
export const dynamic = 'force-dynamic'; // No caching
```

### Request Timeouts

API routes define maximum durations to prevent long-running requests:

```typescript
export const maxDuration = 60; // Max request duration in seconds
```

### Efficient Polling

The polling implementation uses a recursive approach with:
- 3-second intervals between checks
- Early termination on success or failure
- Callback for progress updates

### UI Optimizations

- File previews only generated after validation
- Tailwind CSS for optimized styling
- Loading states to provide user feedback
- Conditional rendering to minimize DOM elements

---

This technical documentation covers the implementation details of the Live Portrait Animation module in the FaceTalk application. It provides a comprehensive overview of the frontend and backend components, data flow, security measures, and optimization techniques used to create a seamless user experience. 