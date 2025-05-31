'use client';

import React, { useState } from 'react';
import { useFeedback, FeedbackType, FeedbackData } from '../../lib/useFeedback';

interface FeedbackFormProps {
  defaultType?: FeedbackType;
  onClose?: () => void;
  compact?: boolean;
}

export default function FeedbackForm({ defaultType = 'general', onClose, compact = false }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(defaultType);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  
  const { submitFeedback, resetFeedbackState, submitting, error, success } = useFeedback();
  
  // 处理反馈提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message && feedbackType !== 'satisfaction') {
      alert('Please enter your feedback');
      return;
    }
    
    if (feedbackType === 'satisfaction' && rating === null) {
      alert('Please select a rating');
      return;
    }
    
    const feedbackData: FeedbackData = {
      type: feedbackType,
      message,
      rating: rating || undefined,
      contactInfo: showContactForm ? contactInfo : undefined
    };
    
    const success = await submitFeedback(feedbackData);
    
    if (success) {
      // 重置表单
      setTimeout(() => {
        setMessage('');
        setRating(null);
        setContactInfo('');
        setShowContactForm(false);
        
        // 关闭表单
        if (onClose) {
          setTimeout(onClose, 3000);
        }
      }, 1000);
    }
  };
  
  // 渲染评分组件
  const renderRatingComponent = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How would you rate your experience?
        </label>
        <div className="flex space-x-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                rating === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md ${compact ? 'p-4' : 'p-6'}`}>
      {/* 标题 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={compact ? 'text-lg font-medium' : 'text-xl font-semibold'}>
          We Value Your Feedback
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 错误和成功消息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
          Thank you for your feedback! We appreciate your input.
        </div>
      )}
      
      {!success && (
        <form onSubmit={handleSubmit}>
          {/* 反馈类型选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('general')}
                className={`py-2 px-3 rounded-md text-sm ${
                  feedbackType === 'general'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                General Feedback
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`py-2 px-3 rounded-md text-sm ${
                  feedbackType === 'bug'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Report a Bug
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`py-2 px-3 rounded-md text-sm ${
                  feedbackType === 'feature'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Feature Request
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('satisfaction')}
                className={`py-2 px-3 rounded-md text-sm ${
                  feedbackType === 'satisfaction'
                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Satisfaction Rating
              </button>
            </div>
          </div>
          
          {/* 评分组件 (仅满意度反馈) */}
          {feedbackType === 'satisfaction' && renderRatingComponent()}
          
          {/* 消息输入 */}
          <div className="mb-4">
            <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 mb-2">
              {feedbackType === 'bug'
                ? 'Please describe the issue you encountered'
                : feedbackType === 'feature'
                ? 'What feature would you like to see?'
                : feedbackType === 'satisfaction'
                ? 'Additional comments (optional)'
                : 'Your feedback'}
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                feedbackType === 'bug'
                  ? 'What happened? What did you expect to happen?'
                  : feedbackType === 'feature'
                  ? 'Describe the feature you would like us to add'
                  : 'Tell us what you think...'
              }
              required={feedbackType !== 'satisfaction'}
            />
          </div>
          
          {/* 联系表单切换 */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowContactForm(!showContactForm)}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              {showContactForm ? 'Hide contact information' : 'Add contact information for follow-up'}
            </button>
          </div>
          
          {/* 联系信息表单 */}
          {showContactForm && (
            <div className="mb-4">
              <label htmlFor="contact-info" className="block text-sm font-medium text-gray-700 mb-2">
                Email or other contact info
              </label>
              <input
                id="contact-info"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your email address or other contact information"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll only use this to follow up on your feedback if needed.
              </p>
            </div>
          )}
          
          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      )}
    </div>
  );
} 