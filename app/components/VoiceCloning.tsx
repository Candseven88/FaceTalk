import React, { useState, useRef, useEffect } from 'react';
import { fileToBase64, validateFileSize, pollPrediction } from '../utils';
import { PredictionResponse } from '../types';
import { usePoints } from '../../lib/usePoints';
import { useAuth } from '../../lib/useAuth';
import { useProgressTracking } from '../../lib/useProgressTracking';
import { useRouter } from 'next/navigation';
import HowToUse from './HowToUse';
import { saveGeneration, updateUsageStats } from '../../lib/firebase';

// 本地存储键名
const LOCAL_STORAGE_VOICE_GENERATION_KEY = 'facetalk_last_voice_generation';
const LOCAL_STORAGE_GENERATIONS_KEY = 'facetalk_generations';

export default function VoiceCloning() {
  const [voiceSampleFile, setVoiceSampleFile] = useState<File | null>(null);
  const [voiceSamplePreview, setVoiceSamplePreview] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [chunkLength, setChunkLength] = useState<number>(250);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const voiceSampleInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  
  // Use the points system
  const { deductPoints, isDeducting, error: pointsError, getFeatureCost } = usePoints();
  const featureCost = getFeatureCost('voiceCloning');
  
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
    const lastGeneration = localStorage.getItem(LOCAL_STORAGE_VOICE_GENERATION_KEY);
    if (lastGeneration) {
      try {
        const { result, timestamp } = JSON.parse(lastGeneration);
        // 检查是否是最近24小时内的生成结果
        const generationTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - generationTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && result) {
          console.log('Restoring last voice generation result from localStorage');
          setAudioResult(result);
        } else {
          // 如果超过24小时，清除本地存储
          localStorage.removeItem(LOCAL_STORAGE_VOICE_GENERATION_KEY);
        }
      } catch (error) {
        console.error('Error parsing last voice generation from localStorage:', error);
      }
    }
  }, []);

  // How-to-use steps
  const howToUseSteps = [
    "Upload a clear voice sample audio file (WAV or MP3 format, 5-10 seconds recommended).",
    "Enter the text you want to be spoken in the cloned voice.",
    "Optionally, provide prompt text to guide the voice generation.",
    "Adjust the chunk length if needed (default: 250).",
    "Click 'Generate Voice Clone' to create the audio.",
    "Once processing is complete, you can play and download the cloned voice audio."
  ];

  // Handle voice sample selection
  const handleVoiceSampleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!validateFileSize(file)) {
        setError('Voice sample must be less than 5MB');
        return;
      }
      
      if (!file.type.includes('audio')) {
        setError('File must be an audio file (WAV, MP3, etc.)');
        return;
      }
      
      setVoiceSampleFile(file);
      try {
        const base64 = await fileToBase64(file);
        setVoiceSamplePreview(base64);
        setError(null);
      } catch (err) {
        setError('Failed to process voice sample');
        console.error(err);
      }
    }
  };

  // 保存生成结果到localStorage
  const saveGenerationToLocalStorage = (result: string) => {
    const generationData = {
      result,
      timestamp: new Date().toISOString(),
      type: 'voiceCloning'
    };
    
    // 保存最后一次生成结果
    localStorage.setItem(LOCAL_STORAGE_VOICE_GENERATION_KEY, JSON.stringify(generationData));
    
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
      console.log('Voice generation saved to localStorage');
    } catch (error) {
      console.error('Error saving voice generation to localStorage:', error);
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
      const generationId = await saveGeneration(user.uid, 'voiceCloning', result, featureCost);
      
      // 更新用户使用统计
      await updateUsageStats(user.uid, featureCost);
      
      console.log('Voice generation saved to Firestore with ID:', generationId);
    } catch (error) {
      console.error('Error saving voice generation to Firestore:', error);
    } finally {
      setIsSavingResult(false);
    }
  };

  // Generate voice clone
  const handleGenerate = async () => {
    if (!voiceSampleFile || !text) {
      setError('Both voice sample and text are required');
      return;
    }

    // Check if user has enough points
    const hasEnoughPoints = await deductPoints('voiceCloning');
    
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
    setAudioResult(null);
    
    // Create a task ID
    const taskId = `voice_${Date.now()}`;
    setCurrentTaskId(taskId);
    
    // Create a task in the tracking system
    createTask(taskId, 'voiceCloning', { text, promptText, chunkLength });

    try {
      // Convert files to base64
      const voiceSampleBase64 = await fileToBase64(voiceSampleFile);

      // Initiate prediction
      const response = await fetch('/api/voice-clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          prompt_text: promptText,
          chunk_length: chunkLength,
          voice_sample: voiceSampleBase64
        }),
      });

      // Handle server errors
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate voice clone');
      }

      setProgress('Processing...');
      updateTaskProgress(taskId, 'Processing voice clone...');

      // Poll for prediction results
      const result = await pollPrediction(
        data.id, 
        (progressStatus: string) => {
          setProgress(progressStatus);
          updateTaskProgress(taskId, progressStatus);
        },
        'voice'
      );
      
      // Handle successful prediction
      if (result.output) {
        const outputUrl = Array.isArray(result.output) 
          ? result.output[0] 
          : result.output;
        setAudioResult(outputUrl);
        
        // 保存结果到localStorage
        saveGenerationToLocalStorage(outputUrl);
        
        // 保存结果到Firestore
        await saveGenerationToFirestore(outputUrl);
        
        // Complete the task in the tracking system
        completeTask(taskId, outputUrl);
      } else {
        throw new Error('No output generated');
      }
    } catch (err: any) {
      console.error('Voice cloning error:', err);
      setError(err.message || 'Failed to generate voice clone');
      
      // Fail the task in the tracking system
      if (currentTaskId) {
        failTask(currentTaskId, err.message || 'Failed to generate voice clone');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setVoiceSampleFile(null);
    setVoiceSamplePreview(null);
    setText('');
    setPromptText('');
    setChunkLength(250);
    setAudioResult(null);
    setError(null);
    setProgress('');
    
    if (voiceSampleInputRef.current) voiceSampleInputRef.current.value = '';
  };

  // Download the generated audio
  const handleDownload = () => {
    if (!audioResult) return;
    
    const link = document.createElement('a');
    link.href = audioResult;
    link.download = 'cloned-voice.wav';
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
      <h2 className="text-2xl font-bold mb-6">Voice Cloning</h2>
      
      {/* How to use guide */}
      <HowToUse
        title="How to Use Voice Cloning"
        steps={howToUseSteps}
        mediaType="audio"
        mediaPath="/guides/voice-cloning-example.mp3"
        mediaAlt="Voice Cloning example"
      />
      
      {/* Points Cost Info */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          This feature costs <span className="font-bold">{featureCost} point</span> per use.
        </p>
      </div>
      
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Voice Sample Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Voice Sample
          </label>
          <div className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 overflow-hidden">
            {voiceSamplePreview ? (
              <audio 
                src={voiceSamplePreview} 
                controls 
                className="max-w-full" 
              />
            ) : (
              <div className="text-center pointer-events-none">
                <p className="text-sm text-gray-500">Click to upload voice sample</p>
                <p className="text-xs text-gray-400 mt-1">WAV, MP3 (Max 5MB)</p>
              </div>
            )}
            <input
              ref={voiceSampleInputRef}
              type="file"
              accept="audio/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleVoiceSampleChange}
              disabled={isProcessing || isDeducting}
            />
          </div>
        </div>

        {/* Text Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Text to Clone
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={4}
              placeholder="Enter the text you want to clone with the voice..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prompt Text (Optional)
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isProcessing || isDeducting}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={2}
              placeholder="Optional prompt text..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chunk Length
            </label>
            <input
              type="number"
              value={chunkLength}
              onChange={(e) => setChunkLength(parseInt(e.target.value) || 250)}
              disabled={isProcessing || isDeducting}
              min={50}
              max={500}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Default: 250</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleGenerate}
          disabled={!voiceSampleFile || !text || isProcessing || isDeducting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : isDeducting ? 'Checking points...' : 'Generate Voice Clone'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={isProcessing || isDeducting}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        
        {audioResult && (
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

      {/* Result Audio */}
      {audioResult && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Generated Voice</h3>
          <div className="bg-gray-100 rounded-lg p-4">
            <audio
              ref={audioRef}
              src={audioResult}
              controls
              className="w-full"
            />
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Audio
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
