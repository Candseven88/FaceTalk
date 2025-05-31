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
            href="/live-portrait" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Live Portrait
          </Link>
          <Link 
            href="/voice-clone" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Voice Clone
          </Link>
          <Link 
            href="/talking-portrait" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Talking Portrait
          </Link>
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
          </div>
        </div>
      </div>
    </div>
  );
} 