/**
 * Credit system management for FaceTalk Pro
 */

import { auth, db } from './firebase-config.js';

// Constants for credit costs
const CREDIT_COSTS = {
  TTS: 1,  // 1 credit per ~7 characters
  LIVE_PORTRAIT: 2,  // 2 credits per second
  SONIC: 4  // 4 credits per second
};

// Character to second ratio for TTS
const CHARS_PER_SECOND = 7;

/**
 * Debounce function to limit the rate at which a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get user's current credit balance
 * @param {string} uid - User ID
 * @returns {Promise<number>} Current credit balance
 */
async function getUserCredits(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    return doc.data()?.creditsLeft || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

/**
 * Calculate required credits for TTS
 * @param {string} text - Input text
 * @returns {number} Required credits
 */
function calculateTTSCredits(text) {
  const estimatedSeconds = Math.ceil(text.length / CHARS_PER_SECOND);
  return estimatedSeconds * CREDIT_COSTS.TTS;
}

/**
 * Calculate required credits for video/audio processing
 * @param {number} durationSeconds - Duration in seconds
 * @param {'LIVE_PORTRAIT' | 'SONIC'} operationType - Type of operation
 * @returns {number} Required credits
 */
function calculateMediaCredits(durationSeconds, operationType) {
  return Math.ceil(durationSeconds * CREDIT_COSTS[operationType]);
}

/**
 * Get audio duration from a File or Blob
 * @param {File|Blob} file - Audio file
 * @returns {Promise<number>} Duration in seconds
 */
function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', reject);
    const url = URL.createObjectURL(file);
    audio.src = url;
    // Clean up the object URL after we're done
    audio.addEventListener('loadedmetadata', () => URL.revokeObjectURL(url), { once: true });
  });
}

/**
 * Get video duration from a File or Blob
 * @param {File|Blob} file - Video file
 * @returns {Promise<number>} Duration in seconds
 */
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.addEventListener('loadedmetadata', () => {
      resolve(video.duration);
    });
    video.addEventListener('error', reject);
    const url = URL.createObjectURL(file);
    video.src = url;
    // Clean up the object URL after we're done
    video.addEventListener('loadedmetadata', () => URL.revokeObjectURL(url), { once: true });
  });
}

/**
 * Create and append a credit estimate element
 * @param {HTMLElement} container - Container to append to
 * @param {string} id - Element ID
 * @returns {HTMLElement} Created element
 */
function createEstimateElement(container, id) {
  const existing = document.getElementById(id);
  if (existing) return existing;
  
  const div = document.createElement('div');
  div.id = id;
  div.className = 'status estimate';
  div.style.display = 'none';
  container.appendChild(div);
  return div;
}

/**
 * Update credit estimate display
 * @param {HTMLElement} estimateElement - Element to update
 * @param {number} requiredCredits - Required credits
 * @param {number} availableCredits - Available credits
 * @param {HTMLButtonElement} actionButton - Button to enable/disable
 */
function updateCreditEstimate(estimateElement, requiredCredits, availableCredits, actionButton) {
  const canProceed = availableCredits >= requiredCredits;
  actionButton.disabled = !canProceed;
  
  estimateElement.textContent = canProceed
    ? `Estimated cost: ${requiredCredits} credits`
    : `Insufficient credits (Required: ${requiredCredits}, Available: ${availableCredits})`;
  estimateElement.className = `status ${canProceed ? 'estimate' : 'error'}`;
  estimateElement.style.display = 'block';
}

/**
 * Check if user has enough credits and update balance
 * @param {string} uid - User ID
 * @param {number} requiredCredits - Number of credits required
 * @returns {Promise<boolean>} Whether the transaction was successful
 */
async function checkAndDeductCredits(uid, requiredCredits) {
  try {
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(uid);
      const doc = await transaction.get(userRef);
      const current = doc.data()?.creditsLeft || 0;
      
      if (current < requiredCredits) {
        throw new Error(`Insufficient credits. Required: ${requiredCredits}, Available: ${current}`);
      }
      
      transaction.update(userRef, { creditsLeft: current - requiredCredits });
    });
    
    return true;
  } catch (error) {
    console.error('Credit transaction failed:', error);
    throw error;
  }
}

/**
 * Update UI elements based on credit status
 * @param {number} requiredCredits - Number of credits required
 * @param {number} availableCredits - Number of credits available
 * @param {HTMLButtonElement} actionButton - Button to enable/disable
 * @param {HTMLElement} statusElement - Element to show status message
 */
function updateCreditUI(requiredCredits, availableCredits, actionButton, statusElement) {
  const canProceed = availableCredits >= requiredCredits;
  actionButton.disabled = !canProceed;
  
  if (statusElement) {
    statusElement.textContent = canProceed
      ? `Estimated cost: ${requiredCredits} credits`
      : `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`;
    statusElement.className = `status ${canProceed ? 'success' : 'error'}`;
    statusElement.style.display = 'block';
  }
}

// Initialize credits system
export function initCredits() {
  updateCreditDisplay();
  setupCreditListeners();
}

// Update credit display
export async function updateCreditDisplay() {
  if (!auth.currentUser) return;
  
  const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
  const credits = userDoc.data()?.creditsLeft || 0;
  
  const display = document.getElementById('credits-display');
  if (display) {
    display.textContent = `Available credits: ${credits}`;
  }
}

// Setup credit system listeners
function setupCreditListeners() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await updateCreditDisplay();
    }
  });
}

// Make functions globally available
window.creditSystem = {
  calculateTTSCredits,
  calculateMediaCredits,
  getAudioDuration,
  getVideoDuration,
  getUserCredits,
  createEstimateElement,
  updateCreditEstimate,
  debounce,
  checkAndDeductCredits,
  updateCreditUI,
  CREDIT_COSTS
}; 