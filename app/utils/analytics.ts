'use client';

import { trackTikTokEvent } from '../components/TikTokPixel';

// Standard TikTok Pixel events
export const TikTokEvents = {
  ViewContent: 'ViewContent',
  ClickButton: 'ClickButton',
  Search: 'Search',
  AddToWishlist: 'AddToWishlist',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  AddPaymentInfo: 'AddPaymentInfo',
  PlaceAnOrder: 'PlaceAnOrder',
  CompletePayment: 'CompletePayment',
  Subscribe: 'Subscribe',
  Contact: 'Contact',
  Download: 'Download',
  SubmitForm: 'SubmitForm',
  CompleteRegistration: 'CompleteRegistration',
};

// Generic event tracking function
export const trackEvent = (event: string, data?: any) => {
  // Log the event
  console.log(`Analytics: Tracking event ${event}`, data);
  
  // Track with TikTok Pixel
  trackTikTokEvent(event, data);
  
  // Can add other analytics services here in the future
};

// Specific event tracking functions
export const trackPageView = (pageName?: string) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.page();
    
    // Also track as ViewContent event with additional data
    if (pageName) {
      trackViewContent({
        content_type: 'page',
        content_id: pageName,
        content_name: `${pageName} Page`
      });
    }
  }
};

// Specific function for ViewContent events
export const trackViewContent = (data: {
  content_type: string;
  content_id: string;
  content_name?: string;
  value?: number;
  currency?: string;
  quantity?: number;
}) => {
  trackEvent(TikTokEvents.ViewContent, data);
};

export const trackSubscription = (data?: any) => {
  trackEvent(TikTokEvents.Subscribe, data);
};

export const trackFormSubmission = (data?: any) => {
  trackEvent(TikTokEvents.SubmitForm, data);
};

export const trackPurchase = (data: {
  value?: number;
  currency?: string;
  content_type?: string;
  content_id?: string;
  content_name?: string;
  quantity?: number;
}) => {
  trackEvent(TikTokEvents.CompletePayment, data);
};

export const trackRegistration = (data?: any) => {
  trackEvent(TikTokEvents.CompleteRegistration, data);
}; 