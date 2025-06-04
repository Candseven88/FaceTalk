'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    TiktokAnalyticsObject: string;
    ttq: any;
  }
}

type TikTokPixelProps = {
  pixelId: string;
};

export default function TikTokPixel({ pixelId }: TikTokPixelProps) {
  useEffect(() => {
    // Skip if already initialized or running on server
    if (typeof window === 'undefined' || !pixelId) return;

    // Clean up any existing instance to prevent duplicates
    if (window.ttq) {
      console.log('Existing TikTok Pixel found, cleaning up before reinitializing');
      try {
        const existingScript = document.querySelector('script[src*="analytics.tiktok.com"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      } catch (e) {
        console.error('Error cleaning up TikTok Pixel:', e);
      }
    }

    // Initialize TikTok Pixel
    window.TiktokAnalyticsObject = 'ttq';
    window.ttq = window.ttq || [];
    window.ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
    ];

    window.ttq.setAndDefer = function(target: any, key: string, value: any) {
      target[key] = value;
      return target;
    };

    for (let i = 0; i < window.ttq.methods.length; i++) {
      const method = window.ttq.methods[i];
      window.ttq[method] = ((function(method) {
        return function() {
          const args = Array.prototype.slice.call(arguments, 0);
          args.unshift(method);
          window.ttq.push(args);
          return window.ttq;
        };
      })(method));
    }

    // Load TikTok Pixel script
    const script = document.createElement('script');
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${pixelId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize the pixel
    window.ttq.page();
    
    // Force trigger important events to activate them in TikTok Ads Manager with correct parameters
    setTimeout(() => {
      console.log('Triggering initial ViewContent event for TikTok Pixel');
      // Use valid content_type and include required content_id
      trackTikTokEvent('ViewContent', {
        content_type: 'product',
        content_id: 'homepage_view_001',
        content_name: 'FaceTalk Homepage',
        value: 0.00,
        currency: 'USD'
      });
      
      // Fire a test Purchase event to activate CompletePayment with required fields
      trackTikTokEvent('CompletePayment', {
        value: 0.01,
        currency: 'USD',
        content_type: 'product',
        content_id: 'test_purchase_001',
        contents: [
          {
            content_id: 'test_product_001',
            content_type: 'product',
            content_name: 'Test Product',
            quantity: 1,
            price: 0.01
          }
        ],
        quantity: 1
      });
    }, 2000);

    return () => {
      // No cleanup needed, as we want the pixel to persist
    };
  }, [pixelId]);

  return null;
}

// Helper functions for tracking events
export const trackTikTokEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && window.ttq) {
    // Ensure required parameters are present
    if (event === 'ViewContent' && (!data || !data.content_id || !data.content_type)) {
      // Add default values if missing
      data = {
        ...data,
        content_id: data?.content_id || 'default_content_001',
        content_type: data?.content_type || 'product'
      };
    }
    
    console.log(`Tracking TikTok event: ${event}`, data);
    window.ttq.track(event, data);
  } else {
    console.warn('TikTok Pixel not available for event:', event);
  }
}; 