'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import LivePortrait from './components/LivePortrait';
import VoiceCloning from './components/VoiceCloning';
import TalkingPortrait from './components/TalkingPortrait';
import EnvChecker from './components/EnvChecker';
import CreditsInfo from './components/CreditsInfo';
import FreeCreditsAlert from './components/FreeCreditsAlert';
import { trackEvent, trackPageView, TikTokEvents } from './utils/analytics';

export default function Home() {
  const [activeTab, setActiveTab] = useState('livePortrait');
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsVisible(true);
    
    // Get tab parameter from URL if it exists
    const tabParam = searchParams.get('tab');
    if (tabParam && ['livePortrait', 'voiceCloning', 'talkingPortrait'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Track page view with TikTok Pixel
    trackPageView();
  }, [searchParams]);

  // Track tab changes
  useEffect(() => {
    if (isVisible) {
      trackEvent(TikTokEvents.ViewContent, {
        content_type: 'tab',
        content_id: activeTab,
        content_name: `FaceTalk ${activeTab} Tab View`
      });
    }
  }, [activeTab, isVisible]);

  const handleCTAClick = (ctaType: string) => {
    trackEvent(TikTokEvents.ClickButton, {
      button_name: ctaType
    });
  };

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Content Creator',
      comment: 'FaceTalk has revolutionized my content. The quality is incredible!',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
    },
    {
      id: 2,
      name: 'Mike Johnson',
      role: 'Marketing Director',
      comment: 'We use FaceTalk for all our corporate presentations. It\'s a game-changer!',
      avatar: '/avatars/mike.jpg',
      rating: 5,
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Education Specialist',
      comment: 'The voice cloning feature is mind-blowing. Perfect for personalized content.',
      avatar: '/avatars/emily.jpg',
      rating: 5,
    }
  ];

  const features = [
    {
      id: 1,
      title: 'Live Portrait Generator',
      description: 'Upload a portrait and driving video to create animated talking portraits',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Voice Clone Generator',
      description: 'Clone any voice with just a short audio sample and generate speech',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Talking Avatar Generator',
      description: 'Combine portraits with audio or text to create realistic talking avatars',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white animated-bg">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-500/10 to-blue-500/5"></div>
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Bring Your Portrait to Life with <span className="text-facebook-blue">AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Transform static images into dynamic, talking avatars with our cutting-edge AI technology. Create realistic animations in minutes, not hours.
              </p>
            </div>
            
            <div className={`flex justify-center transition-all duration-1000 delay-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl">
                <Image 
                  src="/demo-animation.gif" 
                  alt="FaceTalk Demo Animation" 
                  width={800} 
                  height={450} 
                  className="w-full"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-16 text-center animate-fade-in animation-delay-700">
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-facebook-blue">1M+</p>
              <p className="text-gray-600">Avatars Created</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-facebook-blue">50K+</p>
              <p className="text-gray-600">Happy Users</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-facebook-blue">99.9%</p>
              <p className="text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See FaceTalk in Action</h2>
            <p className="text-lg text-gray-600">Experience the magic of AI-powered avatar generation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <div 
                key={feature.id} 
                className="feature-card shadow-card hover:shadow-card-hover animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="mb-4 text-facebook-blue">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Environment Checker (only for development) */}
      <div className="hidden">
        <EnvChecker />
      </div>

      {/* Tab Navigation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your AI Tool</h2>
            <p className="text-lg text-gray-600">Select the perfect generator for your creative needs</p>
          </div>
          
          <CreditsInfo />

          <FreeCreditsAlert />

          <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
            <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('livePortrait')}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm mx-4 transition-all duration-300 ${
                  activeTab === 'livePortrait'
                    ? 'border-facebook-blue text-facebook-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                id="live-portrait"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Live Portrait Generator
                </div>
                {activeTab === 'livePortrait' && (
                  <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
                )}
                {activeTab === 'livePortrait' && (
                  <span className="absolute -top-2 right-0">
                    <span className="animated-badge bg-red-100 text-red-800">Most Popular</span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('voiceCloning')}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm mx-4 transition-all duration-300 ${
                  activeTab === 'voiceCloning'
                    ? 'border-facebook-blue text-facebook-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                id="voice-clone"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Clone Generator
                </div>
                {activeTab === 'voiceCloning' && (
                  <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
                )}
                {activeTab === 'voiceCloning' && (
                  <span className="absolute -top-2 right-0">
                    <span className="animated-badge">New</span>
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('talkingPortrait')}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm mx-4 transition-all duration-300 ${
                  activeTab === 'talkingPortrait'
                    ? 'border-facebook-blue text-facebook-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                id="talking-avatar"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Talking Avatar Generator
                </div>
                {activeTab === 'talkingPortrait' && (
                  <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
                )}
                {activeTab === 'talkingPortrait' && (
                  <span className="absolute -top-2 right-0">
                    <span className="animated-badge bg-green-100 text-green-800">Pro</span>
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-8 animate-fade-in">
              {activeTab === 'livePortrait' && <LivePortrait />}
              {activeTab === 'voiceCloning' && <VoiceCloning />}
              {activeTab === 'talkingPortrait' && <TalkingPortrait />}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Join thousands of satisfied creators</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="facebook-card p-6 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 overflow-hidden flex-shrink-0">
                    {/* Avatar placeholder */}
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500/5 to-blue-500/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="facebook-card p-6 flex flex-col items-center text-center animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-600">Bank-level data encryption and data protection</p>
          </div>
          
          <div className="facebook-card p-6 flex flex-col items-center text-center animate-fade-in animation-delay-100">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Generate avatars in under 30 seconds</p>
          </div>
          
          <div className="facebook-card p-6 flex flex-col items-center text-center animate-fade-in animation-delay-200">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-facebook-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Trusted by Millions</h3>
            <p className="text-gray-600">Used by creators worldwide</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-facebook-blue to-blue-700 text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in">Ready to Transform Your Content?</h2>
          <p className="text-xl mb-8 animate-fade-in animation-delay-100">
            Join thousands of creators who are already bringing their portraits to life with FaceTalk AI. Start your journey today with our free trial.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-200">
            <Link 
              href="/get-started" 
              className="bg-white text-facebook-blue px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => handleCTAClick('start_free_trial')}
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing" 
              className="bg-transparent text-white border border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              onClick={() => handleCTAClick('view_pricing')}
            >
              View Pricing
            </Link>
          </div>
          <p className="text-sm mt-6 text-blue-100 animate-fade-in animation-delay-300">
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </span>
            <span className="ml-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel anytime
            </span>
          </p>
        </div>
      </section>
    </div>
  );
} 