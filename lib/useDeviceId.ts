'use client';

import { useState, useEffect } from 'react';

// 设备ID存储键
const DEVICE_ID_KEY = 'facetalk_device_id';
const MACHINE_ID_KEY = 'facetalk_machine_id';

/**
 * 生成简单的设备指纹，不依赖外部库
 */
const generateSimpleFingerprint = async (): Promise<string> => {
  // 收集浏览器和设备信息
  const info = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceMemory: (navigator as any).deviceMemory || 0,
    doNotTrack: navigator.doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    localStorage: typeof localStorage !== 'undefined',
  };

  // 转换为字符串并使用简单哈希
  const infoStr = JSON.stringify(info);
  let hash = 0;
  for (let i = 0; i < infoStr.length; i++) {
    const char = infoStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }

  // 添加时间戳作为随机因子
  const randomSeed = Date.now().toString(36);
  
  // 生成指纹
  return `FT-${Math.abs(hash).toString(16)}-${randomSeed}`;
};

/**
 * 获取设备唯一ID的Hook
 * 使用简单浏览器指纹和本地存储，提供设备识别
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateDeviceId = async () => {
      try {
        // 先检查localStorage是否已存在设备ID
        const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
        const storedMachineId = localStorage.getItem(MACHINE_ID_KEY);
        
        if (storedDeviceId && storedMachineId) {
          setDeviceId(storedDeviceId);
          setIsLoading(false);
          return;
        }

        // 创建新的设备指纹
        const visitorId = await generateSimpleFingerprint();
        
        // 收集额外硬件信息增强指纹识别
        const hardwareInfo = {
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          cpuCores: navigator.hardwareConcurrency || 0,
          deviceMemory: (navigator as any).deviceMemory || 0,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          colorDepth: window.screen.colorDepth,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language
        };
        
        // 组合生成机器ID
        const machineIdComponents = [
          hardwareInfo.platform,
          hardwareInfo.cpuCores,
          hardwareInfo.deviceMemory,
          hardwareInfo.screenResolution,
          hardwareInfo.timezone
        ].join('|');
        
        // 生成最终设备ID
        const finalDeviceId = `${visitorId}_${btoa(machineIdComponents).substring(0, 10)}`;
        
        // 存储设备ID
        localStorage.setItem(DEVICE_ID_KEY, finalDeviceId);
        localStorage.setItem(MACHINE_ID_KEY, machineIdComponents);
        
        setDeviceId(finalDeviceId);
      } catch (error) {
        console.error('Error generating device fingerprint:', error);
        // 回退到随机ID
        const fallbackId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(DEVICE_ID_KEY, fallbackId);
        setDeviceId(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };

    generateDeviceId();
  }, []);

  return { deviceId, isLoading };
};

/**
 * 获取设备唯一ID的工具函数（非Hook版本）
 */
export const getDeviceId = async (): Promise<string> => {
  // 先检查localStorage是否已存在设备ID
  const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (storedDeviceId) {
    return storedDeviceId;
  }

  // 创建新的设备指纹
  try {
    const visitorId = await generateSimpleFingerprint();
    
    // 收集额外硬件信息
    const hardwareInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      cpuCores: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // 组合生成机器ID
    const machineIdComponents = [
      hardwareInfo.platform,
      hardwareInfo.cpuCores,
      hardwareInfo.deviceMemory,
      hardwareInfo.screenResolution,
      hardwareInfo.timezone
    ].join('|');
    
    // 生成最终设备ID
    const finalDeviceId = `${visitorId}_${btoa(machineIdComponents).substring(0, 10)}`;
    
    // 存储设备ID和机器ID
    localStorage.setItem(DEVICE_ID_KEY, finalDeviceId);
    localStorage.setItem(MACHINE_ID_KEY, machineIdComponents);
    
    return finalDeviceId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // 回退到随机ID
    const fallbackId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(DEVICE_ID_KEY, fallbackId);
    return fallbackId;
  }
}; 