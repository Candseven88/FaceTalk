'use client';

import React, { useState } from 'react';
import { trackTikTokEvent } from './TikTokPixel';

interface PaymentOptionsProps {
  id: string;
  plan: string;
  price: number;
  credits: number;
  onSuccess: () => void;
}

export default function PaymentOptions({ id, plan, price, credits, onSuccess }: PaymentOptionsProps) {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const handlePayment = async (method: string) => {
    setSelectedMethod(method);
    setProcessing(true);
    
    try {
      // Track payment initiated event
      trackTikTokEvent('InitiateCheckout', {
        content_type: 'product',
        content_id: `plan_${plan}`,
        content_name: `FaceTalk ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        value: price,
        currency: 'USD',
        quantity: 1
      });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the success callback
      onSuccess();
      
      // Close the modal
      closeModal();
    } catch (error) {
      console.error('Payment error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedMethod(null);
    }
  };
  
  const closeModal = () => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('hidden');
    }
  };
  
  return (
    <div id={id} className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center border-b border-gray-200 p-4">
          <h3 className="text-xl font-semibold text-gray-900">Payment Options</h3>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${price}/{plan === 'starter' ? 'month' : 'month'}
            </h4>
            <p className="text-gray-600">
              You will receive {credits} credits, which refresh monthly.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handlePayment('credit')}
              disabled={processing}
              className={`w-full flex items-center justify-between border border-gray-300 rounded-md p-4 hover:border-blue-500 hover:bg-blue-50 transition ${
                processing && selectedMethod === 'credit' ? 'bg-blue-50 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium text-gray-800">Credit Card</span>
              </div>
              {processing && selectedMethod === 'credit' ? (
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => handlePayment('paypal')}
              disabled={processing}
              className={`w-full flex items-center justify-between border border-gray-300 rounded-md p-4 hover:border-blue-500 hover:bg-blue-50 transition ${
                processing && selectedMethod === 'paypal' ? 'bg-blue-50 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-800">PayPal</span>
              </div>
              {processing && selectedMethod === 'paypal' ? (
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            By proceeding with the payment, you agree to our 
            <a href="/terms" className="text-blue-600 hover:underline ml-1">Terms of Service</a>
            <span className="mx-1">and</span>
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
} 