/**
 * Live Portrait Generation Module
 */

const REPLICATE_MODEL_VERSION = "a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b";

/**
 * Create a live portrait prediction using Replicate API
 * @param {string} imageUrl - URL of the source image
 * @param {string} videoUrl - URL of the driving video
 * @returns {Promise<string>} URL of the generated video
 */
export async function createLivePortraitPrediction(imageUrl, videoUrl) {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${window.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        version: REPLICATE_MODEL_VERSION,
        input: {
          image: imageUrl,
          video: videoUrl
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate portrait');
    }

    const prediction = await response.json();
    
    // If the prediction is still processing, poll for the result
    if (prediction.status === 'processing') {
      return await pollPredictionResult(prediction.id);
    }

    return prediction.output;
  } catch (error) {
    console.error('Error in createLivePortraitPrediction:', error);
    throw error;
  }
}

/**
 * Poll for prediction results
 * @param {string} predictionId - ID of the prediction to poll
 * @returns {Promise<string>} URL of the generated video
 */
async function pollPredictionResult(predictionId) {
  const maxAttempts = 30;
  const pollInterval = 2000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${window.REPLICATE_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check prediction status');
    }

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction.output;
    }

    if (prediction.status === 'failed') {
      throw new Error(prediction.error || 'Prediction failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
  }

  throw new Error('Prediction timed out');
}

// Export utility functions
export const utils = {
  /**
   * Get video duration safely
   * @param {File} file - Video file
   * @returns {Promise<number>} Duration in seconds
   */
  getVideoDuration: (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const objectUrl = URL.createObjectURL(file);
      
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
        video.remove();
      };

      video.onloadedmetadata = () => {
        cleanup();
        resolve(video.duration);
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Failed to load video metadata'));
      };

      // Set timeout for metadata loading
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Video metadata loading timed out'));
      }, 10000);

      video.src = objectUrl;
    });
  }
};

// Make the function globally available
window.createLivePortraitPrediction = createLivePortraitPrediction; 