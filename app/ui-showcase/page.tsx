'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '../components/Card';
import Testimonials from '../components/Testimonials';
import LoadingState from '../components/LoadingState';

export default function UIShowcase() {
  const [activeSection, setActiveSection] = useState<string>('components');
  const [progress, setProgress] = useState(25);
  
  // Simulate progress for the progress bar demo
  useEffect(() => {
    if (activeSection !== 'loading') return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeSection]);
  
  // Sample icons
  const icons = {
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    portrait: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    voice: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    avatar: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  // Navigation tabs
  const tabs = [
    { id: 'components', label: 'UI Components' },
    { id: 'cards', label: 'Cards' },
    { id: 'buttons', label: 'Buttons' },
    { id: 'loading', label: 'Loading States' },
    { id: 'feedback', label: 'Feedback System' },
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-100 text-facebook-blue text-sm font-semibold rounded-full mb-2 animate-pulse">
            UI Design
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">FaceTalk UI Showcase</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our redesigned UI components with modern Facebook-style design system, 
            animations, and interactive elements.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-12 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`relative py-4 px-4 border-b-2 font-medium text-sm mx-4 whitespace-nowrap transition-all duration-300 ${
                activeSection === tab.id
                  ? 'border-facebook-blue text-facebook-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {activeSection === tab.id && (
                <span className="absolute -bottom-px left-0 w-full h-0.5 bg-facebook-blue animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* UI Components Section */}
        {activeSection === 'components' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Components</h2>
            <p className="text-gray-600 mb-8">
              Our redesigned components feature modern animations, hover effects, and Facebook-style design.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Link href="/dashboard" className="block">
                <Card 
                  title="Dashboard" 
                  subtitle="User analytics and history"
                  icon={icons.dashboard}
                  hasGlow
                  delay={0}
                >
                  <p className="text-gray-600">View your account statistics and generation history</p>
                </Card>
              </Link>
              
              <Link href="/live-portrait" className="block">
                <Card 
                  title="Live Portrait" 
                  subtitle="Create animated portraits"
                  icon={icons.portrait}
                  badge="Popular"
                  hasGlow
                  delay={1}
                >
                  <p className="text-gray-600">Transform static portraits into dynamic animations</p>
                </Card>
              </Link>
              
              <Link href="/voice-clone" className="block">
                <Card 
                  title="Voice Clone" 
                  subtitle="Clone any voice with AI"
                  icon={icons.voice}
                  badge="New"
                  hasGlow
                  delay={2}
                >
                  <p className="text-gray-600">Create realistic voice clones from short audio samples</p>
                </Card>
              </Link>
              
              <Link href="/talking-avatar" className="block">
                <Card 
                  title="Talking Avatar" 
                  subtitle="Generate talking avatars"
                  icon={icons.avatar}
                  hasGlow
                  delay={3}
                >
                  <p className="text-gray-600">Combine portraits with audio for perfect lip-sync</p>
                </Card>
              </Link>
            </div>
            
            <div className="flex justify-center">
              <Link href="/" className="btn-primary">
                Back to Homepage
              </Link>
            </div>
          </section>
        )}

        {/* Cards Section */}
        {activeSection === 'cards' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Card Components</h2>
            <p className="text-gray-600 mb-8">
              Our card components feature various styles with hover effects, glows, and badges.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card 
                title="Standard Card" 
                subtitle="Base card component"
              >
                <p className="text-gray-600">Basic card with title and content</p>
              </Card>
              
              <Card 
                title="Card with Badge" 
                subtitle="Shows status or category"
                badge="Featured"
              >
                <p className="text-gray-600">Card with a badge in the corner</p>
              </Card>
              
              <Card 
                title="Glow Effect Card" 
                subtitle="Highlights on hover"
                hasGlow
              >
                <p className="text-gray-600">Hover to see the subtle glow effect</p>
              </Card>
              
              <Card 
                title="Popular Card" 
                subtitle="Draws attention"
                isPopular
              >
                <p className="text-gray-600">Card with popular badge and highlight</p>
              </Card>
              
              <Card 
                title="Card with Icon" 
                subtitle="Visual indicators"
                icon={icons.portrait}
              >
                <p className="text-gray-600">Card with an icon next to the title</p>
              </Card>
              
              <Card 
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
                title="Gradient Background" 
                subtitle="Visually appealing backgrounds"
              >
                <p className="text-gray-600">Card with a subtle gradient background</p>
              </Card>
            </div>
          </section>
        )}

        {/* Buttons Section */}
        {activeSection === 'buttons' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Components</h2>
            <p className="text-gray-600 mb-8">
              Our buttons feature animations, hover effects, and consistent styling across the application.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="facebook-card p-6">
                <h3 className="text-lg font-semibold mb-4">Primary Buttons</h3>
                <div className="space-y-4">
                  <button className="btn-primary w-full">
                    Standard Button
                  </button>
                  <button className="btn-primary w-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Button with Icon
                  </button>
                  <button className="btn-primary w-full animate-pulse">
                    Animated Button
                  </button>
                </div>
              </div>
              
              <div className="facebook-card p-6">
                <h3 className="text-lg font-semibold mb-4">Secondary Buttons</h3>
                <div className="space-y-4">
                  <button className="btn-secondary w-full">
                    Secondary Button
                  </button>
                  <button className="btn-secondary w-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Info Button
                  </button>
                  <button className="bg-white text-red-600 border border-red-600/30 px-4 py-2 rounded-lg font-medium shadow-button hover:shadow-button-hover hover:border-red-600 transition-all duration-300 transform hover:-translate-y-1 w-full">
                    Danger Button
                  </button>
                </div>
              </div>
              
              <div className="facebook-card p-6">
                <h3 className="text-lg font-semibold mb-4">Special Buttons</h3>
                <div className="space-y-4">
                  <button className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-button transition-all duration-300 transform hover:-translate-y-1 w-full group">
                    <span className="relative z-10">Gradient Button</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button className="relative bg-white text-facebook-blue border border-facebook-blue/30 px-4 py-2 rounded-lg font-medium shadow-button hover:shadow-button-hover hover:border-facebook-blue transition-all duration-300 w-full">
                    <span className="relative z-10">Outline Button</span>
                    <div className="absolute inset-0 bg-facebook-blue/5 opacity-0 hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  </button>
                  <div className="glow-effect rounded-lg">
                    <button className="bg-facebook-blue text-white px-4 py-2 rounded-lg font-medium w-full">
                      Glow Effect Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading States Section */}
        {activeSection === 'loading' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Loading States</h2>
            <p className="text-gray-600 mb-8">
              Our application provides various loading indicators to give users feedback during async operations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Card title="Spinner Loading" subtitle="Classic spinner animation">
                <LoadingState type="spinner" message="Loading your content..." />
              </Card>
              
              <Card title="Progress Bar" subtitle="Shows completion percentage">
                <LoadingState type="progress" message="Generating avatar" progress={progress} />
              </Card>
              
              <Card title="Dots Animation" subtitle="Simple text-based loading">
                <LoadingState type="dots" message="Processing your request" />
              </Card>
              
              <Card title="Pulse Animation" subtitle="Subtle pulse effect">
                <LoadingState type="pulse" message="Analyzing voice sample" />
              </Card>
            </div>
            
            <div className="facebook-card p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">State Transitions</h3>
              <p className="text-gray-600 mb-4">
                Our components smoothly transition between loading, success, and error states.
              </p>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h4 className="font-medium">File Upload Simulation</h4>
                  <button 
                    onClick={() => setProgress(0)}
                    className="text-sm text-facebook-blue hover:text-facebook-hover"
                  >
                    Reset
                  </button>
                </div>
                <div className="p-6">
                  {progress < 100 ? (
                    <div className="animate-fade-in">
                      <LoadingState type="progress" message="Uploading your file" progress={progress} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 animate-fade-in">
                      <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Upload complete!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Feedback System Section */}
        {activeSection === 'feedback' && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Feedback System</h2>
            <p className="text-gray-600 mb-8">
              Our feedback system allows users to leave testimonials and ratings, with Google Forms integration.
            </p>
            
            <Testimonials />
          </section>
        )}
      </div>
    </div>
  );
} 