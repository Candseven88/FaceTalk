import { NextRequest, NextResponse } from 'next/server';

// Set lower duration since we only need to initiate the request, not wait for completion
export const maxDuration = 30; // Max API route duration in seconds (reduced from 60)
export const dynamic = 'force-dynamic'; // No caching

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
    // Extract inputs from request
    const { 
      seed,
      audio,
      image,
      dynamic_scale,
      min_resolution,
      inference_steps,
      keep_resolution
    } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Portrait image is required' },
        { status: 400 }
      );
    }

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Use a timeout for the Replicate API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25-second timeout

    try {
      // Call Replicate API to initiate prediction
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiToken}`
        },
        body: JSON.stringify({
          version: "a2aad29ea95f19747a5ea22ab14fc6594654506e5815f7f5ba4293e888d3e20f", // Talking portrait model
          input: {
            seed: seed || 42,
            audio,
            image,
            dynamic_scale: dynamic_scale || 1,
            min_resolution: min_resolution || 512,
            inference_steps: inference_steps || 25,
            keep_resolution: keep_resolution ?? false
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if request completes

      // Handle API response
      if (!response.ok) {
        const error = await response.json();
        console.error("Replicate API error:", error);
        
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'Authentication failed. Please check your Replicate API token.' },
            { status: 401 }
          );
        }
        
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: error.detail || 'Failed to initiate talking portrait prediction' },
          { status: response.status }
        );
      }

      // Return prediction ID and details
      const prediction = await response.json();
      
      // Add metadata about expected processing time
      return NextResponse.json({
        ...prediction,
        estimated_processing_time: "10-15 minutes",
        model_type: "talking"
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out while initiating prediction', timeout: true },
          { status: 408 }
        );
      }
      
      throw fetchError; // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error('Error generating talking portrait:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process talking portrait request' },
      { status: 500 }
    );
  }
} 