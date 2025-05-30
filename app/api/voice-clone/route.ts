import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Max request duration in seconds
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
    const { text, prompt_text, chunk_length, voice_sample } = await request.json();

    if (!voice_sample) {
      return NextResponse.json(
        { error: 'Voice sample is required' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Text to clone is required' },
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
        version: "0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e", // Voice cloning model
        input: {
          text,
          prompt_text: prompt_text || "",
          chunk_length: chunk_length || 250,
          voice_sample
        }
      })
    });

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
      
      return NextResponse.json(
        { error: error.detail || 'Failed to initiate voice cloning prediction' },
        { status: response.status }
      );
    }

    // Return prediction ID and details
    const prediction = await response.json();
    return NextResponse.json(prediction);
    
  } catch (error: any) {
    console.error('Error cloning voice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process voice cloning request' },
      { status: 500 }
    );
  }
} 