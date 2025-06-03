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
    if (typeof window === 'undefined' || window.ttq) return;

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

    return () => {
      // Cleanup if needed
      document.head.removeChild(script);
    };
  }, [pixelId]);

  return null;
}

// Helper functions for tracking events
export const trackTikTokEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(event, data);
  }
}; 