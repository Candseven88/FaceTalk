'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this to an API
    setFeedbackSubmitted(true);
    setTimeout(() => setFeedbackSubmitted(false), 3000);
    setEmailInput('');
  };
  
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 pt-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-facebook-blue rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2 shadow-sm">
                F
              </div>
              <span className="font-bold text-xl text-gray-800">FaceTalk</span>
            </div>
            <p className="text-gray-600 mb-4">
              Transform your portraits into dynamic, talking avatars with cutting-edge AI technology.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" className="text-gray-500 hover:text-facebook-blue transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com" className="text-gray-500 hover:text-facebook-blue transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://linkedin.com" className="text-gray-500 hover:text-facebook-blue transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="animate-fade-in animation-delay-100">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/live-portrait" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Live Portrait
                </Link>
              </li>
              <li>
                <Link href="/voice-clone" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Voice Clone
                </Link>
              </li>
              <li>
                <Link href="/talking-avatar" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Talking Avatar
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="animate-fade-in animation-delay-200">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-600 hover:text-facebook-blue transition-colors duration-200">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Feedback Form */}
          <div className="animate-fade-in animation-delay-300">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Share Your Feedback
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label htmlFor="feedback-email" className="sr-only">Email</label>
                <input
                  id="feedback-email"
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-facebook-blue focus:border-facebook-blue"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSermFAkp6UU0Us3cD464W4KyrQmX-LRpwMwf65TC_KZ-F2LJA/viewform?usp=sharing&ouid=109318936006223507296" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-primary w-full flex justify-center"
              >
                Share Feedback
              </a>
              {feedbackSubmitted && (
                <p className="text-green-600 text-sm animate-fade-in">
                  Thank you for your feedback!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-200 pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-facebook-blue">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-500 hover:text-facebook-blue">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-sm text-gray-500 hover:text-facebook-blue">
                Cookie Policy
              </Link>
              <Link href="/security" className="text-sm text-gray-500 hover:text-facebook-blue">
                Security
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FaceTalk. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 