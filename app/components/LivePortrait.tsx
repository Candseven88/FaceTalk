import React, { useState, useRef, useEffect } from 'react';
import { fileToBase64, validateFileSize, pollPrediction } from '../utils';
import { PredictionResponse } from '../types';
import { usePoints } from '../../lib/usePoints';
import { useAuth } from '../../lib/useAuth';
import { useProgressTracking } from '../../lib/useProgressTracking';
import { useRouter } from 'next/navigation';
import HowToUse from './HowToUse';
import { saveGeneration, updateUsageStats } from '../../lib/firebase';
import Link from 'next/link';

// 本地存储键名
const LOCAL_STORAGE_GENERATION_KEY = 'facetalk_last_generation';
const LOCAL_STORAGE_GENERATIONS_KEY = 'facetalk_generations';

export default function LivePortrait() {
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [drivingFile, setDrivingFile] = useState<File | null>(null);
  const [drivingPreview, setDrivingPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const drivingInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  
  // 使用进度跟踪hook
  const { 
    createTask, 
    updateTaskProgress, 
    completeTask, 
    failTask,
    getTask
  } = useProgressTracking();
  
  // Use the points system
  const { deductPoints, isDeducting, error: pointsError, getFeatureCost } = usePoints();
  const featureCost = getFeatureCost('livePortrait');

  // 从本地存储恢复上次生成的结果
  useEffect(() => {
    const lastGeneration = localStorage.getItem(LOCAL_STORAGE_GENERATION_KEY);
    if (lastGeneration) {
      try {
        const { result, timestamp, taskId } = JSON.parse(lastGeneration);
        // 检查是否是最近24小时内的生成结果
        const generationTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - generationTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && result) {
          console.log('Restoring last generation result from localStorage');
          setVideoResult(result);
          
          // 如果有任务ID，尝试加载任务状态
          if (taskId) {
            setCurrentTaskId(taskId);
            const task = getTask(taskId);
            if (task && (task.status === 'pending' || task.status === 'processing')) {
              setIsProcessing(true);
              setProgress(task.progress);
            }
          }
        } else {
          // 如果超过24小时，清除本地存储
          localStorage.removeItem(LOCAL_STORAGE_GENERATION_KEY);
        }
      } catch (error) {
        console.error('Error parsing last generation from localStorage:', error);
      }
    }
  }, [getTask]);

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

  // 保存生成结果到localStorage
  const saveGenerationToLocalStorage = (result: string, taskId?: string) => {
    const generationData = {
      result,
      timestamp: new Date().toISOString(),
      type: 'livePortrait',
      taskId
    };
    
    // 保存最后一次生成结果
    localStorage.setItem(LOCAL_STORAGE_GENERATION_KEY, JSON.stringify(generationData));
    
    // 添加到生成历史
    try {
      const localGenerations = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GENERATIONS_KEY) || '[]');
      localGenerations.unshift({
        id: `local_${Date.now()}`,
        ...generationData
      });
      
      // 最多保存10个
      if (localGenerations.length > 10) {
        localGenerations.pop();
      }
      
      localStorage.setItem(LOCAL_STORAGE_GENERATIONS_KEY, JSON.stringify(localGenerations));
      console.log('Generation saved to localStorage');
    } catch (error) {
      console.error('Error saving generation to localStorage:', error);
    }
  };

  // 保存生成结果到Firestore
  const saveGenerationToFirestore = async (result: string) => {
    if (!user) {
      console.log('No user found, skipping Firestore save');
      return;
    }
    
    setIsSavingResult(true);
    try {
      // 保存到Firestore
      const generationId = await saveGeneration(user.uid, 'livePortrait', result, featureCost);
      
      // 更新用户使用统计
      await updateUsageStats(user.uid, featureCost);
      
      console.log('Generation saved to Firestore with ID:', generationId);
    } catch (error) {
      console.error('Error saving generation to Firestore:', error);
    } finally {
      setIsSavingResult(false);
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

      // 创建任务记录
      const inputs = {
        portraitFilename: portraitFile.name,
        drivingFilename: drivingFile.name
      };
      
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
      
      // 使用任务ID创建任务
      const taskId = data.id;
      setCurrentTaskId(taskId);
      createTask(taskId, 'livePortrait', inputs);
      
      // 保存初始状态到localStorage，包含任务ID
      saveGenerationToLocalStorage('', taskId);

      // Poll for prediction results
      const result = await pollPrediction(
        data.id, 
        (progressText) => {
          setProgress(progressText);
          updateTaskProgress(taskId, progressText);
        }
      );
      
      // Handle successful prediction
      if (result.output) {
        const outputUrl = Array.isArray(result.output) 
          ? result.output[0] 
          : result.output;
        setVideoResult(outputUrl);
        
        // 更新任务状态为已完成
        completeTask(taskId, outputUrl);
        
        // 保存结果到localStorage
        saveGenerationToLocalStorage(outputUrl, taskId);
        
        // 保存结果到Firestore
        await saveGenerationToFirestore(outputUrl);
      } else {
        throw new Error('No output generated');
      }
    } catch (err: any) {
      console.error('Animation error:', err);
      setError(err.message || 'Failed to generate animation');
      
      // 更新任务状态为失败
      if (currentTaskId) {
        failTask(currentTaskId, err.message || 'Failed to generate animation');
      }
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
    setCurrentTaskId(null);
    
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

  // 查看历史生成
  const handleViewHistory = () => {
    router.push('/tasks');
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
        
        <Link
          href="/tasks"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          View Tasks
        </Link>
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse" style={{ width: isProcessing ? '100%' : '0%' }}></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-600">{progress}</p>
            {isProcessing && (
              <Link href="/tasks" className="text-xs text-blue-600 hover:underline">
                You can check progress later in Tasks
              </Link>
            )}
          </div>
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
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Video
            </button>
            
            {isSavingResult && (
              <p className="text-sm text-gray-600 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving result...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 