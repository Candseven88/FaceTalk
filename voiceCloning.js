/**
 * Generates a cloned voice from a sample audio using the Replicate API
 * @param {string} referenceAudioUrl - Public URL of the reference voice sample
 * @param {string} inputText - Text to be spoken in the cloned voice
 * @returns {Promise<string>} URL of the generated audio file
 */
async function generateVoiceFromSample(referenceAudioUrl, inputText) {
  // Calculate required credits
  const requiredCredits = window.creditSystem.calculateTTSCredits(inputText);
  
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
      version: "0494f04972b675631af41c253a45c4341bf637f07eed9a39bad3b1fd66f73a2e",
      input: {
        audio: referenceAudioUrl,
        text: inputText
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
    
    // Return the output URL (the generated audio file URL)
    return data.output;
  } catch (error) {
    console.error("Error generating cloned voice:", error);
    throw error;
  }
}

// Make the function globally available
window.generateVoiceFromSample = generateVoiceFromSample; 