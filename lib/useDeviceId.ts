'use client';

import { useState, useEffect } from 'react';

// Device ID storage keys
const DEVICE_ID_KEY = 'facetalk_device_id';
const MACHINE_ID_KEY = 'facetalk_machine_id';

// Default timeout for device ID generation (ms)
const DEVICE_ID_GENERATION_TIMEOUT = 2000;

/**
 * Generate a simple device fingerprint, not dependent on external libraries
 * Optimized to avoid blocking UI thread
 */
const generateSimpleFingerprint = async (): Promise<string> => {
  // Check for existing fingerprint first for immediate response
  const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  // Basic device info that can be quickly accessed
  const quickInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  
  // Generate a quick fingerprint for immediate use
  const quickFingerprintStr = JSON.stringify(quickInfo);
  let quickHash = 0;
  for (let i = 0; i < quickFingerprintStr.length; i++) {
    const char = quickFingerprintStr.charCodeAt(i);
    quickHash = ((quickHash << 5) - quickHash) + char;
    quickHash = quickHash & quickHash;
  }
  
  // Add random factor for uniqueness
  const randomSeed = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  const quickFingerprint = `FT-${Math.abs(quickHash).toString(16)}-${randomSeed}`;
  
  // Save quick fingerprint immediately
  localStorage.setItem(DEVICE_ID_KEY, quickFingerprint);
  
  // Create a promise for the more complete fingerprint
  const detailedFingerprintPromise = new Promise<string>((resolve) => {
    // Use requestIdleCallback or setTimeout to avoid blocking UI
    const runDetailed = () => {
      try {
        // Collect full browser and device information
        const detailedInfo = {
          ...quickInfo,
          platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          screenDepth: window.screen.colorDepth,
          deviceMemory: (navigator as any).deviceMemory || 0,
          doNotTrack: navigator.doNotTrack,
          cookieEnabled: navigator.cookieEnabled,
          localStorage: typeof localStorage !== 'undefined',
        };

        // Generate detailed fingerprint
        const infoStr = JSON.stringify(detailedInfo);
        let hash = 0;
        for (let i = 0; i < infoStr.length; i++) {
          const char = infoStr.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Build final fingerprint
        const detailedFingerprint = `FT-${Math.abs(hash).toString(16)}-${randomSeed}`;
        
        // Update stored fingerprint if different
        if (detailedFingerprint !== quickFingerprint) {
          localStorage.setItem(DEVICE_ID_KEY, detailedFingerprint);
        }
        
        resolve(detailedFingerprint);
      } catch (error) {
        console.error('Error in detailed fingerprint generation:', error);
        resolve(quickFingerprint); // Fall back to quick fingerprint
      }
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => runDetailed());
    } else {
      setTimeout(runDetailed, 50); // Small delay to let UI render first
    }
  });
  
  // Create a timeout promise
  const timeoutPromise = new Promise<string>(resolve => {
    setTimeout(() => resolve(quickFingerprint), DEVICE_ID_GENERATION_TIMEOUT);
  });
  
  // Race between detailed fingerprint and timeout
  return Promise.race([detailedFingerprintPromise, timeoutPromise]);
};

/**
 * Get device ID hook
 * Uses simple browser fingerprinting and local storage for device identification
 * Optimized for immediate UI response
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(
    // Initialize with stored ID if available for immediate UI response
    typeof localStorage !== 'undefined' ? localStorage.getItem(DEVICE_ID_KEY) : null
  );
  const [isLoading, setIsLoading] = useState(deviceId === null);

  useEffect(() => {
    // Only run generation if no ID already set
    if (deviceId !== null) return;
    
    const generateDeviceId = async () => {
      try {
        const generatedId = await generateSimpleFingerprint();
        setDeviceId(generatedId);
      } catch (error) {
        console.error('Error generating device fingerprint:', error);
        // Fall back to random ID
        const fallbackId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(DEVICE_ID_KEY, fallbackId);
        setDeviceId(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };

    generateDeviceId();
  }, [deviceId]);

  return { deviceId, isLoading };
};

/**
 * Get device ID utility function (non-Hook version)
 * Returns immediately with stored ID if available, or generates a new one
 */
export const getDeviceId = async (): Promise<string> => {
  return generateSimpleFingerprint();
}; 