'use client';

import React from 'react';
import TaskManager from '../components/TaskManager';
import Link from 'next/link';

export default function TasksPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-gray-600 mt-2">View and manage your generation tasks</p>
          </div>
        </div>
        
        <div className="mb-8 flex justify-center space-x-4">
          <Link 
            href="/?tab=livePortrait" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Live Portrait
          </Link>
          <Link 
            href="/?tab=voiceCloning" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voice Clone
          </Link>
          <Link 
            href="/?tab=talkingPortrait" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Talking Portrait
          </Link>
        </div>
        
        {/* Processing Time Expectations */}
        <div className="mb-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Processing Time Expectations</h2>
          <p className="text-gray-700 mb-4">
            Our AI models work hard to create high-quality results. Different features require different processing times:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <h3 className="font-semibold">Live Portrait</h3>
              </div>
              <p className="text-sm text-gray-600">Typically takes <span className="font-semibold">3-10 minutes</span> to complete</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <h3 className="font-semibold">Voice Clone</h3>
              </div>
              <p className="text-sm text-gray-600">Typically takes <span className="font-semibold">2-5 minutes</span> to complete</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <h3 className="font-semibold">Talking Portrait</h3>
              </div>
              <p className="text-sm text-gray-600">Typically takes <span className="font-semibold">10-15 minutes</span> to complete</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Processing Timeline:</span>
            </p>
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-blue-200 flex items-center justify-center text-xs">
                Initializing
              </div>
              <div className="absolute left-1/4 top-0 bottom-0 w-2/4 bg-blue-300 flex items-center justify-center text-xs">
                Processing
              </div>
              <div className="absolute left-3/4 top-0 bottom-0 w-1/4 bg-blue-400 flex items-center justify-center text-xs">
                Finalizing
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Feel free to close this page while processing - your tasks will continue running on our servers.
            </p>
          </div>
        </div>
        
        <TaskManager />
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">About Your Tasks</h2>
          <div className="prose max-w-none">
            <p>
              Tasks are saved locally in your browser. They will persist even if you refresh the page 
              or close your browser. However, they are specific to this device and browser.
            </p>
            <p className="mt-4">
              <strong>For Anonymous Users:</strong> Your tasks and generated results are stored locally 
              and will be available for up to 24 hours. To keep your results permanently, consider 
              downloading them or <Link href="/get-started" className="text-blue-600 hover:underline">creating an account</Link>.
            </p>
            
            <div className="mt-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Memory Preservation Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>For best results, use clear frontal portraits with good lighting</li>
                <li>Save meaningful generations by downloading the results</li>
                <li>Create an account to access your history from any device</li>
                <li>Try different driving videos for more varied expressions</li>
                <li>Share your creations with loved ones for special occasions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 