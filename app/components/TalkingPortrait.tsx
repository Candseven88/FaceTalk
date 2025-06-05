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
const LOCAL_STORAGE_TALKING_GENERATION_KEY = 'facetalk_last_talking_generation';
const LOCAL_STORAGE_GENERATIONS_KEY = 'facetalk_generations';

export default function TalkingPortrait() {
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [seed, setSeed] = useState<number>(42);
  const [dynamicScale, setDynamicScale] = useState<number>(1);
  const [minResolution, setMinResolution] = useState<number>(512);
  const [inferenceSteps, setInferenceSteps] = useState<number>(25);
  const [keepResolution, setKeepResolution] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { user, userPlan } = useAuth();
  
  // Use the points system
  const { deductPoints, isDeducting, error: pointsError, getFeatureCost } = usePoints();
  const featureCost = getFeatureCost('talkingPortrait');
  
  // 使用进度跟踪hook
  const { 
    createTask, 
    updateTaskProgress, 
    completeTask, 
    failTask,
    getTask
  } = useProgressTracking();

  // 从本地存储恢复上次生成的结果
  useEffect(() => {
    const lastGeneration = localStorage.getItem(LOCAL_STORAGE_TALKING_GENERATION_KEY);
    if (lastGeneration) {
      try {
        const { result, timestamp } = JSON.parse(lastGeneration);
        // 检查是否是最近24小时内的生成结果
        const generationTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - generationTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && result) {
          console.log('Restoring last talking portrait result from localStorage');
          setVideoResult(result);
        } else {
          // 如果超过24小时，清除本地存储
          localStorage.removeItem(LOCAL_STORAGE_TALKING_GENERATION_KEY);
        }
      } catch (error) {
        console.error('Error parsing last talking portrait from localStorage:', error);
      }
    }
  }, []);

  // 检查是否是免费用户
  useEffect(() => {
    if (user && userPlan && userPlan.plan === 'free') {
      setError('This feature is not available for free users. Please upgrade your plan to access Talking Portrait.');
    }
  }, [user, userPlan]);

  // How-to-use steps
  const howToUseSteps = [
    "Upload a portrait image with a clear face (frontal view recommended).",
    "Upload an audio file containing speech or singing.",
    "Adjust advanced settings if needed (seed, dynamic scale, etc.).",
    "Click 'Generate Talking Portrait' to create a video.",
    "The process will take 10-15 minutes. Once complete, you can view and download the talking portrait video."
  ];

  // Handle portrait image selection
  const handlePortraitChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file)) {
        setError('Portrait image must be less than 5MB');
        return;
      }
      
      if (!file.type.includes('image')) {
        setError('File must be an image (JPG, PNG, etc.)');
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

  // Handle audio file selection
  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file)) {
        setError('Audio file must be less than 5MB');
        return;
      }
      
      if (!file.type.includes('audio')) {
        setError('File must be an audio file (WAV, MP3, etc.)');
        return;
      }
      
      setAudioFile(file);
      try {
        const base64 = await fileToBase64(file);
        setAudioPreview(base64);
        setError(null);
      } catch (err) {
        setError('Failed to process audio file');
        console.error(err);
      }
    }
  };

  // 保存生成结果到localStorage
  const saveGenerationToLocalStorage = (result: string, taskId?: string) => {
    const generationData = {
      result,
      timestamp: new Date().toISOString(),
      type: 'talkingPortrait',
      taskId
    };
    
    // 保存最后一次生成结果
    localStorage.setItem(LOCAL_STORAGE_TALKING_GENERATION_KEY, JSON.stringify(generationData));
    
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
      console.log('Talking portrait saved to localStorage');
    } catch (error) {
      console.error('Error saving talking portrait to localStorage:', error);
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
      const generationId = await saveGeneration(user.uid, 'talkingPortrait', result, featureCost);
      
      // 更新用户使用统计
      await updateUsageStats(user.uid, featureCost);
      
      console.log('Talking portrait saved to Firestore with ID:', generationId);
    } catch (error) {
      console.error('Error saving talking portrait to Firestore:', error);
    } finally {
      setIsSavingResult(false);
    }
  };

  // Generate talking portrait
  const handleGenerate = async () => {
    // 免费用户不能使用此功能
    if (user && userPlan && userPlan.plan === 'free') {
      router.push('/pricing');
      return;
    }
    
    if (!portraitFile || !audioFile) {
      setError('Both portrait image and audio file are required');
      return;
    }

    // Check if user has enough points
    const hasEnoughPoints = await deductPoints('talkingPortrait');
    
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
    
    // Create a task ID
    const taskId = `talking_${Date.now()}`;
    setCurrentTaskId(taskId);
    
    // Create a task in the tracking system
    createTask(taskId, 'talkingPortrait', { 
      seed, 
      dynamicScale, 
      minResolution, 
      inferenceSteps, 
      keepResolution 
    });

    try {
      // Convert files to base64
      const portraitBase64 = await fileToBase64(portraitFile);
      const audioBase64 = await fileToBase64(audioFile);

      // Show initial processing message
      setProgress('Starting prediction... This may take 10-15 minutes to complete.');
      updateTaskProgress(taskId, 'Starting prediction... This may take 10-15 minutes to complete.');

      // Initiate prediction
      const response = await fetch('/api/talking-portrait', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seed,
          image: portraitBase64,
          audio: audioBase64,
          dynamic_scale: dynamicScale,
          min_resolution: minResolution,
          inference_steps: inferenceSteps,
          keep_resolution: keepResolution
        }),
      });

      // Handle server errors
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate talking portrait');
      }

      setProgress('Processing started. The Talking Portrait model typically takes 10-15 minutes to complete.');
      updateTaskProgress(taskId, 'Processing started. The Talking Portrait model typically takes 10-15 minutes to complete.');

      // Poll for prediction results with the 'talking' model type for longer polling intervals
      const result = await pollPrediction(
        data.id, 
        (progressStatus: string) => {
          setProgress(progressStatus);
          updateTaskProgress(taskId, progressStatus);
        }, 
        'talking'
      );
      
      // Handle successful prediction
      if (result.output) {
        const outputUrl = Array.isArray(result.output) 
          ? result.output[0] 
          : result.output;
        setVideoResult(outputUrl);
        setProgress('Processing complete! Your talking portrait is ready.');
        
        // 保存结果到localStorage
        saveGenerationToLocalStorage(outputUrl, taskId);
        
        // 保存结果到Firestore
        await saveGenerationToFirestore(outputUrl);
        
        // 更新任务状态为已完成 - 确保任务正确完成
        console.log(`Talking portrait complete. Setting task ${taskId} as completed with output URL length: ${outputUrl.length}`);
        
        // Complete the task in the tracking system
        completeTask(taskId, outputUrl);
        
        // Wait a short time and check if the task was correctly marked as completed
        setTimeout(async () => {
          const task = getTask(taskId);
          if (!task || task.status !== 'completed') {
            console.log('Talking portrait task not properly marked as completed, trying again...');
            completeTask(taskId, outputUrl);
          }
        }, 1000);
      } else {
        throw new Error('No output generated');
      }
    } catch (err: any) {
      console.error('Talking portrait error:', err);
      setError(err.message || 'Failed to generate talking portrait');
      
      // Fail the task in the tracking system
      if (currentTaskId) {
        failTask(currentTaskId, err.message || 'Failed to generate talking portrait');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setPortraitFile(null);
    setPortraitPreview(null);
    setAudioFile(null);
    setAudioPreview(null);
    setSeed(42);
    setDynamicScale(1);
    setMinResolution(512);
    setInferenceSteps(25);
    setKeepResolution(false);
    setVideoResult(null);
    setError(null);
    setProgress('');
    
    if (portraitInputRef.current) portraitInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  // Download the generated video
  const handleDownload = () => {
    if (!videoResult) return;
    
    const link = document.createElement('a');
    link.href = videoResult;
    link.download = 'talking-portrait.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 查看历史生成
  const handleViewHistory = () => {
    router.push('/dashboard');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Talking Portrait</h2>
      
      {/* How to use guide */}
      <HowToUse
        title="How to Use Talking Portrait"
        steps={howToUseSteps}
        mediaType="gif"
        mediaPath="/guides/talking-portrait-guide.gif"
        mediaAlt="Talking Portrait example"
      />
      
      {/* Points Cost Info */}
      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <Link href="/pricing" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Upgrade Your Plan
          </Link>
        </div>
      ) : (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            This feature costs <span className="font-bold">{featureCost} points</span> per use.
          </p>
        </div>
      )}
      
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

        {/* Audio Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Audio File
          </label>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 overflow-hidden">
            {audioPreview ? (
              <audio 
                src={audioPreview} 
                controls 
                className="max-w-full" 
              />
            ) : (
              <div className="text-center pointer-events-none">
                <p className="text-sm text-gray-500">Click to upload audio file</p>
                <p className="text-xs text-gray-400 mt-1">WAV, MP3 (Max 5MB)</p>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleAudioChange}
              disabled={isProcessing || isDeducting}
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Advanced Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Seed
            </label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dynamic Scale
            </label>
            <input
              type="number"
              value={dynamicScale}
              onChange={(e) => setDynamicScale(parseFloat(e.target.value) || 1)}
              step="0.1"
              min="0.1"
              max="2"
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min Resolution
            </label>
            <input
              type="number"
              value={minResolution}
              onChange={(e) => setMinResolution(parseInt(e.target.value) || 512)}
              step="64"
              min="256"
              max="1024"
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inference Steps
            </label>
            <input
              type="number"
              value={inferenceSteps}
              onChange={(e) => setInferenceSteps(parseInt(e.target.value) || 25)}
              min="10"
              max="50"
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={keepResolution}
              onChange={(e) => setKeepResolution(e.target.checked)}
              disabled={isProcessing || isDeducting}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Keep Original Resolution</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleGenerate}
          disabled={!portraitFile || !audioFile || isProcessing || isDeducting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : isDeducting ? 'Checking points...' : 'Generate Talking Portrait'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={isProcessing || isDeducting}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        
        {videoResult && (
          <button
            onClick={handleViewHistory}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View History
          </button>
        )}
      </div>

      {/* Progress Display */}
      {progress && (
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 animate-pulse" 
              style={{ width: isProcessing ? '100%' : '0%' }}
            ></div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600">{progress}</p>
            {isProcessing && progress.includes('take 10-15 minutes') && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> The Talking Portrait model takes 10-15 minutes to process. You can keep this tab open 
                  or check back later - your request will continue processing on our servers.
                </p>
              </div>
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
          <h3 className="text-xl font-semibold mb-4">Generated Talking Portrait</h3>
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
} // Type fix
