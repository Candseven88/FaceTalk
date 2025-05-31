'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import { 
  createUser, 
  signIn, 
  signInWithGoogle, 
  resetPassword, 
  upgradeAnonymousUser 
} from '../../lib/firebase';

interface AuthFormsProps {
  initialView?: 'signup' | 'login' | 'reset';
  onSuccess?: () => void;
}

export default function AuthForms({ initialView = 'login', onSuccess }: AuthFormsProps) {
  const [view, setView] = useState<'signup' | 'login' | 'reset'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const isAnonymous = user?.isAnonymous;

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signIn(email, password);
      setSuccess('Logged in successfully');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getAuthErrorMessage(err.code) || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理注册
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 如果是匿名用户，升级为正式账户
      if (isAnonymous) {
        await upgradeAnonymousUser(email, password);
      } else {
        // 否则创建新用户
        await createUser(email, password);
      }
      
      setSuccess('Account created successfully');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(getAuthErrorMessage(err.code) || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理密码重置
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(getAuthErrorMessage(err.code) || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理Google登录
  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signInWithGoogle();
      setSuccess('Logged in with Google successfully');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('Failed to log in with Google');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取友好的错误消息
  const getAuthErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email format';
      case 'auth/user-disabled':
        return 'Account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Try again later.';
      default:
        return '';
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      {/* 标题 */}
      <h2 className="text-2xl font-bold text-center mb-6">
        {view === 'login' ? 'Log In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
      </h2>
      
      {/* 错误和成功消息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
          {success}
        </div>
      )}
      
      {/* 表单 */}
      <form onSubmit={view === 'login' ? handleLogin : view === 'signup' ? handleSignup : handleResetPassword}>
        {/* 邮箱输入 */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        
        {/* 密码输入 (登录和注册视图) */}
        {view !== 'reset' && (
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        )}
        
        {/* 确认密码 (只在注册视图) */}
        {view === 'signup' && (
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
        )}
        
        {/* 提交按钮 */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : view === 'login' ? (
            'Log In'
          ) : view === 'signup' ? (
            'Create Account'
          ) : (
            'Send Reset Email'
          )}
        </button>
      </form>
      
      {/* Google登录按钮 */}
      <div className="mt-4">
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
              fill="#4285F4"
            />
            <path d="M12 5.432l2.752 1.89-2.752-5.432zM7.8 14.4l-1.2-1.2 1.2-4.8z" fill="#34A853" />
            <path d="M12 18.012l-4.2 2.388 4.2-10.8z" fill="#FBBC05" />
            <path d="M12 18.012l4.2-10.8-4.2 2.388z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>
      
      {/* 视图切换链接 */}
      <div className="mt-4 text-center text-sm">
        {view === 'login' ? (
          <>
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setView('signup')}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Sign up
              </button>
            </p>
            <p className="mt-2">
              <button
                type="button"
                onClick={() => setView('reset')}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </p>
          </>
        ) : view === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setView('login')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Log in
            </button>
          </p>
        ) : (
          <p>
            <button
              type="button"
              onClick={() => setView('login')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              Back to login
            </button>
          </p>
        )}
      </div>
    </div>
  );
} 