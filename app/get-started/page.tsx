'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/AuthContext';

export default function GetStarted() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (activeTab === 'register') {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setLoginData({
        ...loginData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!loginData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!loginData.password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-subtle-bg">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center mb-6">
            <div className="h-10 w-10 bg-facebook-blue rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2 shadow-sm">
              F
            </div>
            <span className="font-bold text-xl text-gray-800">
              FaceTalk
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab === 'register' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'register' 
              ? 'Get started with FaceTalk to bring your portraits to life' 
              : 'Sign in to access your FaceTalk dashboard'}
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-sm font-medium text-center ${
                activeTab === 'register'
                  ? 'text-facebook-blue border-b-2 border-facebook-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-medium text-center ${
                activeTab === 'login'
                  ? 'text-facebook-blue border-b-2 border-facebook-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
          </div>

          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Create a password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Confirm your password"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full btn-primary py-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-facebook-blue focus:border-facebook-blue"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-facebook-blue focus:ring-facebook-blue border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-sm">
                      <a href="#" className="text-facebook-blue hover:text-facebook-hover">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full btn-primary py-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center text-sm">
            {activeTab === 'register' ? (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setActiveTab('login')} 
                  className="text-facebook-blue hover:text-facebook-hover font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => setActiveTab('register')} 
                  className="text-facebook-blue hover:text-facebook-hover font-medium"
                >
                  Register now
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to FaceTalk's</p>
          <div className="mt-1 space-x-2">
            <Link href="/terms-of-service" className="text-facebook-blue hover:text-facebook-hover">
              Terms of Service
            </Link>
            <span>and</span>
            <Link href="/privacy-policy" className="text-facebook-blue hover:text-facebook-hover">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 