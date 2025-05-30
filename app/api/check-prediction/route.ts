import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10; // Max API route duration in seconds
export const dynamic = 'force-dynamic'; // No caching

export async function GET(request: NextRequest) {
  const apiToken = process.env.REPLICATE_API_TOKEN || '';
  
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Replicate API token is missing. Please add REPLICATE_API_TOKEN to your .env.local file.' },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    // Check prediction status with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiToken}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout if fetch completes

      if (!response.ok) {
        const error = await response.json();
        console.error("Replicate API status check error:", error);
        
        // Special handling for common errors
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Prediction not found. The ID may be invalid or the prediction may have expired.' },
            { status: 404 }
          );
        }
        
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: error.detail || 'Failed to check prediction status' },
          { status: response.status }
        );
      }

      const prediction = await response.json();
      return NextResponse.json(prediction);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout errors specifically
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out while checking prediction status', timeout: true },
          { status: 408 }
        );
      }
      
      throw fetchError; // Re-throw for general error handling
    }
  } catch (error: any) {
    console.error('Error checking prediction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check prediction status', 
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
} 