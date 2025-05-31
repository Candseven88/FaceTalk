'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass-navbar shadow-md py-2 border-b border-gray-200/50' 
          : 'bg-transparent py-3'
      }`}
      style={{
        backgroundImage: scrolled 
          ? 'linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(249, 250, 255, 0.9))' 
          : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 bg-facebook-blue rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2 shadow-sm">
                F
              </div>
              <span className={`font-bold text-xl ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                FaceTalk
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/#live-portrait" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/live-portrait') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Live Portrait
            </Link>
            <Link 
              href="/#voice-clone" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/voice-clone') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Voice Clone
            </Link>
            <Link 
              href="/#talking-avatar" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/talking-avatar') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Talking Avatar
            </Link>
            <Link 
              href="/tasks" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/tasks') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Tasks
            </Link>
            <Link 
              href="/pricing" 
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/pricing') 
                  ? 'text-facebook-blue font-medium bg-blue-50' 
                  : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
              }`}
            >
              Pricing
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/dashboard') 
                    ? 'text-facebook-blue font-medium bg-blue-50' 
                    : 'text-gray-600 hover:text-facebook-blue hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-facebook-blue focus:outline-none"
                >
                  <div className="h-8 w-8 bg-facebook-blue rounded-full flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium">{user.name.split(' ')[0]}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/tasks" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Your Tasks
                    </Link>
                    <Link 
                      href="/dashboard?tab=settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Account Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button 
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/get-started" className="btn-primary animate-fade-in">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-700 hover:text-facebook-blue"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-lg ${isActive('/') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/#live-portrait" 
            className={`block px-3 py-2 rounded-lg ${isActive('/live-portrait') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Live Portrait
          </Link>
          <Link 
            href="/#voice-clone" 
            className={`block px-3 py-2 rounded-lg ${isActive('/voice-clone') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Voice Clone
          </Link>
          <Link 
            href="/#talking-avatar" 
            className={`block px-3 py-2 rounded-lg ${isActive('/talking-avatar') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Talking Avatar
          </Link>
          <Link 
            href="/tasks" 
            className={`block px-3 py-2 rounded-lg ${isActive('/tasks') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Tasks
          </Link>
          <Link 
            href="/pricing" 
            className={`block px-3 py-2 rounded-lg ${isActive('/pricing') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          {user && (
            <Link 
              href="/dashboard" 
              className={`block px-3 py-2 rounded-lg ${isActive('/dashboard') ? 'bg-blue-50 text-facebook-blue' : 'text-gray-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
          <div className="pt-4 border-t border-gray-200 mt-2">
            {user ? (
              <>
                <div className="px-3 py-2 mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-facebook-blue rounded-full flex items-center justify-center text-white font-medium mr-2">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/get-started" 
                className="block px-3 py-2 rounded-lg bg-facebook-blue text-white mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 