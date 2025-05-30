'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HowToUseProps {
  title: string;
  steps: string[];
  mediaType: 'gif' | 'audio';
  mediaPath: string;
  mediaAlt?: string;
}

export default function HowToUse({ title, steps, mediaType, mediaPath, mediaAlt = 'usage example' }: HowToUseProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left text-blue-800 font-medium"
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {title}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-blue-200">
          <ol className="list-decimal list-inside mb-4 text-sm text-gray-700">
            {steps.map((step, index) => (
              <li key={index} className="mb-2">{step}</li>
            ))}
          </ol>

          {/* Media example */}
          <div className="mt-4 flex justify-center">
            {mediaType === 'gif' ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Image 
                  src={mediaPath} 
                  alt={mediaAlt} 
                  width={480} 
                  height={270} 
                  className="max-w-full h-auto"
                />
              </div>
            ) : (
              <div className="w-full max-w-md">
                <audio 
                  controls 
                  className="w-full" 
                  src={mediaPath}
                >
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-center mt-1 text-gray-500">Example of voice cloning result</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 