// Video generation module for FaceTalk
window.generateTalkingVideo = async function(imageUrl, audioUrl) {
  // Get audio duration and calculate required credits
  const duration = await window.creditSystem.getAudioDuration(audioUrl);
  const requiredCredits = window.creditSystem.calculateMediaCredits(duration, 'SONIC');
  
  // Get current user
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("User must be logged in to use this feature");
  }
  
  // Check and deduct credits
  await window.creditSystem.checkAndDeductCredits(user.uid, requiredCredits);
  
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${window.REPLICATE_API_KEY}`
      },
      body: JSON.stringify({
        version: "a2aad29e...",  // Sonic model version
        input: { image: imageUrl, audio: audioUrl }
      })
    });
    const result = await response.json();
    return result.urls?.get;  // return video playback URL
  } catch (error) {
    console.error('Error generating talking video:', error);
    throw error;
  }
};

// Status message handling
function showSpeakStatus(message, isError = false) {
  const speakStatus = document.getElementById('speak-status');
  speakStatus.textContent = message;
  speakStatus.className = isError ? 'status error' : 'status success';
  speakStatus.style.display = 'block';
  if (!isError) setTimeout(() => speakStatus.style.display = 'none', 5000);
}

// Check if user has used their daily generation
async function checkDailyUsage(uid) {
  try {
    const userDoc = await db.collection('usageStats').doc(uid).get();
    if (!userDoc.exists) return true; // New user, allow usage
    
    const lastUsed = userDoc.data().lastUsed?.toDate();
    if (!lastUsed) return true; // No usage record, allow usage
    
    const today = new Date();
    return !isSameDay(lastUsed, today);
  } catch (error) {
    console.error('Error checking daily usage:', error);
    return false; // Fail safe: don't allow usage on error
  }
}

// Update user's last usage timestamp
async function updateLastUsed(uid) {
  try {
    await db.collection('usageStats').doc(uid).set({
      lastUsed: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating usage timestamp:', error);
  }
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Initialize the video generation functionality
document.addEventListener('DOMContentLoaded', function() {
  const speakButton = document.getElementById('make-speak-btn');
  const videoLoader = document.getElementById('video-loader');
  const videoContainer = document.getElementById('video-result-container');
  const videoElement = document.getElementById('generated-video');
  
  // Portrait upload handling
  const portraitInput = document.getElementById('speak-portrait');
  const portraitPreview = document.getElementById('speak-portrait-preview');
  let speakPortraitImageUrl = null;
  let currentUser = null;

  // Handle Firebase Authentication
  auth.signInAnonymously().catch(error => {
    console.error('Error signing in anonymously:', error);
    showSpeakStatus('Error initializing user session. Please refresh the page.', true);
  });

  // Listen for auth state changes
  auth.onAuthStateChanged(async user => {
    if (user) {
      currentUser = user;
      // Update credit display
      const userDoc = await db.collection('users').doc(user.uid).get();
      const creditsLeft = userDoc.data()?.creditsLeft || 0;
      showSpeakStatus(`Available credits: ${creditsLeft}`, false);
    } else {
      currentUser = null;
      speakButton.disabled = true;
      showSpeakStatus('Error: User session not found. Please refresh the page.', true);
    }
  });

  // Handle portrait image upload
  portraitInput.addEventListener('change', async (e) => {
    const portraitFile = e.target.files[0];
    if (!portraitFile) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      portraitPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = event.target.result;
      portraitPreview.appendChild(img);
    };
    reader.readAsDataURL(portraitFile);
    
    // Upload to imgbb
    try {
      speakButton.disabled = true;
      showSpeakStatus('Uploading image...', false);
      
      const formData = new FormData();
      formData.append('image', portraitFile);
      formData.append('key', window.IMGBB_API_KEY);
      
      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        speakPortraitImageUrl = data.data.url;
        showSpeakStatus('Image uploaded successfully!', false);
        speakButton.disabled = false;
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showSpeakStatus(`Error uploading image: ${error.message}`, true);
      speakButton.disabled = true;
    }
  });

  // Handle speak button click
  speakButton.addEventListener('click', async function() {
    if (!currentUser) {
      showSpeakStatus('Error: User session not found. Please refresh the page.', true);
      return;
    }

    const audioUrl = document.getElementById('clonedVoiceAudioUrl').value;

    if (!speakPortraitImageUrl || !audioUrl) {
      showSpeakStatus('Please upload both an image and generate a cloned voice first', true);
      return;
    }

    try {
      speakButton.disabled = true;
      videoLoader.style.display = 'block';
      videoContainer.style.display = 'none';
      showSpeakStatus('Generating talking video...', false);

      const videoUrl = await window.generateTalkingVideo(speakPortraitImageUrl, audioUrl);
      
      videoElement.src = videoUrl;
      videoContainer.style.display = 'block';
      
      // Update credit display after successful generation
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const creditsLeft = userDoc.data()?.creditsLeft || 0;
      showSpeakStatus(`Video generated successfully! Available credits: ${creditsLeft}`, false);
      
      // Scroll to result
      videoContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error generating video:', error);
      showSpeakStatus(`Error generating video: ${error.message}`, true);
      speakButton.disabled = false;
    } finally {
      videoLoader.style.display = 'none';
    }
  });
}); 