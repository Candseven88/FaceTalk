'use client';

import { useState, useEffect } from 'react';
import { EnvCheckResult } from '../types';

export default function EnvChecker() {
  const [tokenStatus, setTokenStatus] = useState<string>('Checking...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await fetch('/api/check-env');
        const data: EnvCheckResult = await response.json();
        
        if (data.tokenAvailable && 
            data.tokenFormat?.startsWithR8 && 
            data.connectionTest.status === 'success') {
          setTokenStatus('✅ Replicate API token is properly configured');
          setErrorDetails(null);
        } else {
          // Build detailed error message
          let errors = [];
          
          if (!data.tokenAvailable) {
            errors.push('- Replicate API token is missing');
          } else if (!data.tokenFormat?.startsWithR8) {
            errors.push('- Replicate API token has invalid format (should start with "r8_")');
          }
          
          if (data.connectionTest.status !== 'success') {
            errors.push(`- API connection test failed: ${data.connectionTest.error || 'Unknown error'}`);
          }
          
          setTokenStatus('❌ Environment configuration issues detected');
          setErrorDetails(errors.join('\n'));
          setIsExpanded(true);
        }
      } catch (error) {
        setTokenStatus('❌ Failed to check environment configuration');
        setErrorDetails('Could not connect to the API route to verify configuration');
        setIsExpanded(true);
      }
    };
    
    checkToken();
  }, []);
  
  if (!errorDetails) {
    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-600">{tokenStatus}</p>
      </div>
    );
  }
  
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-red-600">{tokenStatus}</p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-500 hover:text-red-700"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-4">
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{errorDetails}</pre>
          
          <div className="mt-4 p-3 bg-white rounded border border-red-100">
            <h4 className="text-sm font-medium text-red-700">Troubleshooting Steps:</h4>
            <ol className="mt-2 text-xs text-red-600 list-decimal list-inside space-y-1">
              <li>Create or update <code className="bg-red-50 px-1">.env.local</code> file in the project root</li>
              <li>Add <code className="bg-red-50 px-1">REPLICATE_API_TOKEN=your_token_here</code> with your Replicate API token</li>
              <li>Make sure your token starts with <code className="bg-red-50 px-1">r8_</code></li>
              <li>Restart the development server</li>
              <li>If issues persist, verify your Replicate account and API token at <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="underline">replicate.com</a></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 