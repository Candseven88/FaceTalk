import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Max request duration in seconds
export const dynamic = 'force-dynamic'; // No caching

export async function POST(request: NextRequest) {
  // Try different ways to access the token
  const apiToken = process.env.REPLICATE_API_TOKEN || '';
  
  console.log("API Token format check:", apiToken.startsWith('r8_'), "Length:", apiToken.length > 5 ? 'OK' : 'Too short');
  
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Replicate API token is missing. Please add REPLICATE_API_TOKEN to your .env.local file.' },
      { status: 500 }
    );
  }
  
  if (!apiToken.startsWith('r8_')) {
    return NextResponse.json(
      { error: 'Invalid Replicate API token format. Token must start with "r8_".' },
      { status: 500 }
    );
  }

  try {
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
        version: "a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b", // Live Portrait model
        input: {
          image,
          video
        }
      })
    });

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
        { error: error.detail || 'Failed to initiate prediction' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
    
  } catch (error: any) {
    console.error('Error generating animation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process animation request' },
      { status: 500 }
    );
  }
} 