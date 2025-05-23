/**
 * Creates a prediction using the live-portrait model on Replicate
 * @param {string} imageUrl - Public URL of the portrait image
 * @param {string} videoUrl - Public URL of the driving video
 * @returns {Promise<string>} URL of the generated video
 */
async function createLivePortraitPrediction(imageUrl, videoUrl) {
  // Get video duration and calculate required credits
  const duration = await window.creditSystem.getVideoDuration(videoUrl);
  const requiredCredits = window.creditSystem.calculateMediaCredits(duration, 'LIVE_PORTRAIT');
  
  // Get current user
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("User must be logged in to use this feature");
  }
  
  // Check and deduct credits
  await window.creditSystem.checkAndDeductCredits(user.uid, requiredCredits);
  
  // Define API endpoint
  const endpoint = "https://api.replicate.com/v1/predictions";
  
  // Get API key from window object
  const apiKey = window.REPLICATE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Replicate API key not found. Please set window.REPLICATE_API_KEY before calling this function.");
  }
  
  // Set up request options
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
      "Prefer": "wait"
    },
    body: JSON.stringify({
      version: "a6ea89def8d2125215e4d2f920d608b171866840f8b5bff3be46c4c1ce9b259b",
      input: {
        image: imageUrl,
        video: videoUrl
      }
    })
  };
  
  try {
    // Make the API request
    const response = await fetch(endpoint, options);
    
    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error || response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Return the first output URL (the generated video URL)
    return data.output[0];
  } catch (error) {
    console.error("Error creating live portrait prediction:", error);
    throw error;
  }
}

// Make the function globally available
window.createLivePortraitPrediction = createLivePortraitPrediction; 