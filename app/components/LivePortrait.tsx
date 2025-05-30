import React, { useState, useRef } from 'react';
import { fileToBase64, validateFileSize, pollPrediction } from '../utils';
import { PredictionResponse } from '../types';
import { usePoints } from '../../lib/usePoints';
import { useRouter } from 'next/navigation';
import HowToUse from './HowToUse';

export default function LivePortrait() {
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [drivingFile, setDrivingFile] = useState<File | null>(null);
  const [drivingPreview, setDrivingPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const drivingInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  
  // Use the points system
  const { deductPoints, isDeducting, error: pointsError, getFeatureCost } = usePoints();
  const featureCost = getFeatureCost('livePortrait');

  // How-to-use steps
  const howToUseSteps = [
    "Upload a portrait image of a person (clear face, frontal view recommended).",
    "Upload a driving video showing facial expressions and movements.",
    "Click 'Generate Animation' to create a video where the portrait mimics the movements in the driving video.",
    "The process will take a few minutes. Once complete, you can view and download the animated portrait."
  ];

  // Handle portrait image selection
  const handlePortraitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file)) {
        setError('Portrait image must be less than 5MB');
        return;
      }
      
      setPortraitFile(file);
      try {
        const base64 = await fileToBase64(file);
        setPortraitPreview(base64);
        setError(null);
      } catch (err) {
        setError('Failed to process portrait image');
        console.error(err);
      }
    }
  };

  // Handle driving video selection
  const handleDrivingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file)) {
        setError('Driving video must be less than 5MB');
        return;
      }
      
      setDrivingFile(file);
      try {
        const base64 = await fileToBase64(file);
        setDrivingPreview(base64);
        setError(null);
      } catch (err) {
        setError('Failed to process driving video');
        console.error(err);
      }
    }
  };

  // Generate animation
  const handleGenerate = async () => {
    if (!portraitFile || !drivingFile) {
      setError('Both portrait image and driving video are required');
      return;
    }

    // Check if user has enough points
    const hasEnoughPoints = await deductPoints('livePortrait');
    
    if (!hasEnoughPoints) {
      setError(pointsError || 'Not enough points to use this feature');
      
      // Redirect to pricing page if not enough points
      setTimeout(() => {
        router.push('/pricing');
      }, 3000);
      
      return;
    }

    setIsProcessing(true);
    setProgress('Initializing...');
    setError(null);
    setVideoResult(null);

    try {
      // Convert files to base64
      const portraitBase64 = await fileToBase64(portraitFile);
      const drivingBase64 = await fileToBase64(drivingFile);

      // Initiate prediction
      const response = await fetch('/api/generate-animation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: portraitBase64,
          video: drivingBase64
        }),
      });

      // Handle server errors
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate animation');
      }

      setProgress('Processing...');

      // Poll for prediction results
      const result = await pollPrediction(data.id, setProgress);
      
      // Handle successful prediction
      if (result.output) {
        const outputUrl = Array.isArray(result.output) 
          ? result.output[0] 
          : result.output;
        setVideoResult(outputUrl);
      } else {
        throw new Error('No output generated');
      }
    } catch (err: any) {
      console.error('Animation error:', err);
      setError(err.message || 'Failed to generate animation');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setPortraitFile(null);
    setPortraitPreview(null);
    setDrivingFile(null);
    setDrivingPreview(null);
    setVideoResult(null);
    setError(null);
    setProgress('');
    
    if (portraitInputRef.current) portraitInputRef.current.value = '';
    if (drivingInputRef.current) drivingInputRef.current.value = '';
  };

  // Download the generated video
  const handleDownload = () => {
    if (!videoResult) return;
    
    const link = document.createElement('a');
    link.href = videoResult;
    link.download = 'animated-portrait.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Live Portrait Animation</h2>
      
      {/* How to use guide */}
      <HowToUse
        title="How to Use Live Portrait Animation"
        steps={howToUseSteps}
        mediaType="gif"
        mediaPath="/guides/live-portrait-guide.gif"
        mediaAlt="Live Portrait Animation example"
      />
      
      {/* Points Cost Info */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          This feature costs <span className="font-bold">{featureCost} points</span> per use.
        </p>
      </div>
      
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Portrait Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Portrait Image
          </label>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 overflow-hidden">
            {portraitPreview ? (
              <img 
                src={portraitPreview} 
                alt="Portrait preview" 
                className="max-h-full object-contain"
              />
            ) : (
              <div className="text-center pointer-events-none">
                <p className="text-sm text-gray-500">Click to upload portrait image</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
              </div>
            )}
            <input
              ref={portraitInputRef}
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handlePortraitChange}
              disabled={isProcessing || isDeducting}
            />
          </div>
        </div>

        {/* Driving Video Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Driving Video
          </label>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 overflow-hidden">
            {drivingPreview ? (
              <video 
                src={drivingPreview} 
                controls 
                className="max-h-full max-w-full" 
              />
            ) : (
              <div className="text-center pointer-events-none">
                <p className="text-sm text-gray-500">Click to upload driving video</p>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV, WEBM (Max 5MB)</p>
              </div>
            )}
            <input
              ref={drivingInputRef}
              type="file"
              accept="video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleDrivingChange}
              disabled={isProcessing || isDeducting}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleGenerate}
          disabled={!portraitFile || !drivingFile || isProcessing || isDeducting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : isDeducting ? 'Checking points...' : 'Generate Animation'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={isProcessing || isDeducting}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: isProcessing ? '100%' : '0%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          {error.includes('Not enough points') && (
            <p className="text-sm text-red-600 mt-2">Redirecting to pricing page...</p>
          )}
        </div>
      )}

      {/* Result Video */}
      {videoResult && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Generated Animation</h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoResult}
              controls
              autoPlay
              loop
              className="w-full max-h-[500px]"
            />
          </div>
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 