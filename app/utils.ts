import { PredictionResponse } from './types';

/**
 * Converts a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

/**
 * Estimate the remaining time for a prediction
 * @param startTime - Time when the prediction was started
 * @param progress - Progress percentage (0-100)
 * @returns - Estimated time remaining in minutes
 */
export const estimateRemainingTime = (startTime: number, progress: number): number => {
  if (progress <= 0) return 0;
  
  const elapsedMs = Date.now() - startTime;
  const estimatedTotalMs = (elapsedMs / progress) * 100;
  const remainingMs = estimatedTotalMs - elapsedMs;
  
  return Math.round(remainingMs / (1000 * 60)); // Convert to minutes
};

/**
 * Get appropriate polling interval based on model type
 * @param modelType - Type of model being used
 * @returns - Polling interval in milliseconds
 */
export const getPollingInterval = (modelType: 'portrait' | 'voice' | 'talking' = 'portrait'): number => {
  switch (modelType) {
    case 'talking': 
      return 10000; // 10 seconds for talking portrait (long running)
    case 'voice': 
      return 5000;  // 5 seconds for voice cloning
    case 'portrait':
    default:
      return 3000;  // 3 seconds for portrait animation
  }
};

/**
 * Polls a prediction until it completes or fails
 * @param id - Prediction ID to poll
 * @param onProgress - Callback function to update progress status
 * @param modelType - Type of model being used (affects polling interval)
 * @param maxAttempts - Maximum number of polling attempts before giving up
 * @returns - Final prediction response
 */
export const pollPrediction = async (
  id: string, 
  onProgress: ((status: string) => void) | React.Dispatch<React.SetStateAction<string>> = () => {},
  modelType: 'portrait' | 'voice' | 'talking' = 'portrait',
  maxAttempts: number = 180 // Default to 180 attempts (30 minutes for talking portrait)
): Promise<PredictionResponse> => {
  // Track number of attempts and start time
  let attempts = 0;
  const startTime = performance.now();
  
  // 检查浏览器是否支持后台同步（Background Sync API）
  const hasBackgroundSync = 'SyncManager' in window;
  
  // 保存上次任务状态用于恢复
  const storeCheckpoint = (status: string, prediction: PredictionResponse) => {
    try {
      localStorage.setItem(`prediction_status_${id}`, JSON.stringify({
        status,
        prediction,
        lastChecked: new Date().toISOString(),
        attempts,
        startTime
      }));
    } catch (e) {
      console.warn('Failed to store prediction checkpoint:', e);
    }
  };
  
  // 尝试恢复上一次的检查点
  const tryRestoreCheckpoint = (): { attempts: number, startTime: number } | null => {
    try {
      const checkpointData = localStorage.getItem(`prediction_status_${id}`);
      if (checkpointData) {
        const checkpoint = JSON.parse(checkpointData);
        return {
          attempts: checkpoint.attempts || 0,
          startTime: checkpoint.startTime || performance.now()
        };
      }
    } catch (e) {
      console.warn('Failed to restore prediction checkpoint:', e);
    }
    return null;
  };
  
  // 尝试恢复上一次的检查点
  const checkpoint = tryRestoreCheckpoint();
  if (checkpoint) {
    attempts = checkpoint.attempts;
    // 不恢复startTime，总是用当前时间重新计算，以避免过长的等待时间估计
  }
  
  // 如果支持后台同步API，注册一个同步任务
  // 由于TypeScript类型问题，暂时禁用后台同步功能
  /*
  if (hasBackgroundSync && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(`prediction-${id}`);
      console.log('Registered background sync for prediction:', id);
    } catch (e) {
      console.warn('Failed to register background sync:', e);
    }
  }
  */
  
  const poll = async (): Promise<PredictionResponse> => {
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error(`Polling timed out after ${maxAttempts} attempts. Your prediction may still be processing. Check the Tasks page later.`);
    }
    
    try {
      const response = await fetch(`/api/check-prediction?id=${id}`);
      
      if (!response.ok) {
        // If server error, wait and retry rather than failing immediately
        if (response.status >= 500 && response.status < 600) {
          const statusText = `Server error (${response.status}). Retrying...`;
          onProgress(statusText);
          await new Promise(resolve => setTimeout(resolve, getPollingInterval(modelType)));
          return poll();
        }
        
        throw new Error(`Polling failed: ${response.statusText}`);
      }
      
      const prediction: PredictionResponse = await response.json();
      
      // 保存检查点
      storeCheckpoint(prediction.status, prediction);
      
      if (prediction.status === 'succeeded') {
        // 清除检查点数据
        localStorage.removeItem(`prediction_status_${id}`);
        return prediction;
      } else if (prediction.status === 'failed') {
        // 清除检查点数据
        localStorage.removeItem(`prediction_status_${id}`);
        throw new Error(prediction.error || 'Processing failed');
      } else if (prediction.status === 'canceled') {
        // 清除检查点数据
        localStorage.removeItem(`prediction_status_${id}`);
        throw new Error('Processing was canceled');
      }
      
      // Calculate elapsed time and update progress
      const elapsedSeconds = Math.floor((performance.now() - startTime) / 1000);
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      const remainingSeconds = elapsedSeconds % 60;
      
      let statusText = '';
      
      // For talking portrait, provide time estimates
      if (modelType === 'talking') {
        statusText = `Processing (${prediction.status})... Elapsed: ${elapsedMinutes}m ${remainingSeconds}s. This may take 10-15 minutes.`;
      } else {
        statusText = `Processing (${prediction.status})... Elapsed: ${elapsedMinutes}m ${remainingSeconds}s`;
      }
      
      onProgress(statusText);
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, getPollingInterval(modelType)));
      return poll();
    } catch (error: any) {
      // Network error - try again after a delay
      if (error.message && (
          error.message.includes('network') || 
          error.message.includes('connection') || 
          error.message.includes('timeout')
      )) {
        const statusText = `Network error: ${error.message}. Retrying...`;
        onProgress(statusText);
        await new Promise(resolve => setTimeout(resolve, getPollingInterval(modelType) * 2));
        return poll();
      }
      
      // Other errors - rethrow
      throw error;
    }
  };
  
  return poll();
}; 