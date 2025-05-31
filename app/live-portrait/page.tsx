'use client';

import React from 'react';
import LivePortrait from '../components/LivePortrait';
import DiagnosticTool from '../components/DiagnosticTool';

export default function LivePortraitPage() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-subtle-bg min-h-screen">
      <div className="max-w-4xl mx-auto">
        <DiagnosticTool />
        <LivePortrait />
      </div>
    </div>
  );
} 