'use client';

import React from 'react';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  onSelect: () => void;
  disabled?: boolean;
  popular?: boolean;
  isCurrent?: boolean;
}

export default function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  onSelect,
  disabled = false,
  popular = false,
  isCurrent = false
}: PricingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden border ${
      popular ? 'border-blue-500 transform scale-105 z-10' : 'border-gray-200'
    }`}>
      {popular && (
        <div className="bg-blue-600 text-white text-center py-1 px-2 text-sm">
          Most Popular
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        
        <div className="mt-4 mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{price}</span>
            {period && <span className="text-gray-500 ml-1">/{period}</span>}
          </div>
        </div>
        
        <ul className="mb-8 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg 
                className="h-5 w-5 text-green-500 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={onSelect}
          disabled={disabled}
          className={`w-full py-2 px-4 rounded-md transition duration-200 ${
            isCurrent
              ? 'bg-green-100 text-green-800 cursor-default'
              : disabled
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
} 