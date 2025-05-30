'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'dots' | 'pulse';
}

export default function LoadingState({
  message = 'Loading...',
  progress = 0,
  type = 'spinner',
}: LoadingStateProps) {
  const [dots, setDots] = useState('.');
  
  // Animate dots for dot loading type
  useEffect(() => {
    if (type !== 'dots') return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [type]);
  
  // Spinner loading type
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-facebook-blue rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    );
  }
  
  // Progress bar loading type
  if (type === 'progress') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-md mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-facebook-blue h-2.5 rounded-full progress-bar transition-all duration-300" 
            style={{ width: `${Math.max(5, progress)}%` }}
          ></div>
        </div>
        <div className="flex justify-between w-full">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-gray-600 font-medium">{progress}%</p>
        </div>
      </div>
    );
  }
  
  // Dots loading type
  if (type === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-gray-600 font-medium">{message}{dots}</p>
      </div>
    );
  }
  
  // Pulse loading type
  if (type === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-3 h-3 bg-facebook-blue rounded-full"
              style={{ 
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` 
              }}
            ></div>
          ))}
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    );
  }
  
  // Default fallback
  return (
    <div className="flex items-center justify-center p-8">
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
} 