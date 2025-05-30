import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // Max request duration in seconds
export const dynamic = 'force-dynamic'; // No caching

export async function GET(request: NextRequest) {
  // Get API token from environment variables
  const apiToken = process.env.REPLICATE_API_TOKEN || '';
  const environment = process.env.NODE_ENV || 'development';
  
  // Check token availability
  const tokenAvailable = !!apiToken;
  
  // Check token format
  const tokenFormat = tokenAvailable ? {
    startsWithR8: apiToken.startsWith('r8_'),
    length: apiToken.length
  } : null;
  
  // Test connection to Replicate API
  let connectionTest = {
    status: 'unknown',
    error: null as string | null
  };
  
  if (tokenAvailable && tokenFormat?.startsWithR8) {
    try {
      const response = await fetch('https://api.replicate.com/v1/collections', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${apiToken}`
        }
      });
      
      if (response.ok) {
        connectionTest.status = 'success';
      } else {
        const error = await response.json();
        connectionTest.status = 'failed';
        connectionTest.error = error.detail || `API error: ${response.status}`;
      }
    } catch (error: any) {
      connectionTest.status = 'failed';
      connectionTest.error = error.message || 'Unknown error connecting to Replicate API';
    }
  }
  
  // Return environment check results
  return NextResponse.json({
    tokenAvailable,
    tokenFormat,
    environment,
    connectionTest
  });
} 