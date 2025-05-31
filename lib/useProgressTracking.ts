'use client';

import { useState, useEffect } from 'react';

// 本地存储键名前缀
const PROGRESS_STORAGE_KEY_PREFIX = 'facetalk_progress_';
const TASK_STORAGE_KEY = 'facetalk_active_tasks';

export interface ProgressTask {
  id: string;
  type: 'livePortrait' | 'voiceCloning' | 'talkingPortrait';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: string;
  startTime: string;
  lastUpdated: string;
  inputs?: Record<string, any>;
  output?: string;
  error?: string;
}

export const useProgressTracking = () => {
  const [activeTasks, setActiveTasks] = useState<ProgressTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从localStorage加载所有活动任务
  useEffect(() => {
    const loadTasks = () => {
      try {
        const tasksJson = localStorage.getItem(TASK_STORAGE_KEY);
        if (tasksJson) {
          const tasks = JSON.parse(tasksJson) as ProgressTask[];
          
          // 过滤掉24小时前的任务
          const filteredTasks = tasks.filter(task => {
            const lastUpdated = new Date(task.lastUpdated).getTime();
            const now = new Date().getTime();
            const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
            return hoursDiff < 24;
          });
          
          setActiveTasks(filteredTasks);
          
          // 如果有过滤掉的任务，更新存储
          if (filteredTasks.length !== tasks.length) {
            localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(filteredTasks));
          }
        }
      } catch (error) {
        console.error('Error loading tasks from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
    
    // 设置轮询，每5秒检查一次活动任务的进度
    const intervalId = setInterval(() => {
      loadTasks();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 创建新任务
  const createTask = (
    id: string,
    type: 'livePortrait' | 'voiceCloning' | 'talkingPortrait',
    inputs?: Record<string, any>
  ): ProgressTask => {
    const now = new Date().toISOString();
    const newTask: ProgressTask = {
      id,
      type,
      status: 'pending',
      progress: 'Initializing...',
      startTime: now,
      lastUpdated: now,
      inputs
    };
    
    // 更新内存中的活动任务
    setActiveTasks(prev => {
      const updatedTasks = [...prev, newTask];
      // 保存到localStorage
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    
    // 单独保存任务详情，方便快速访问
    localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(newTask));
    
    return newTask;
  };

  // 更新任务进度
  const updateTaskProgress = (id: string, progress: string) => {
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            progress,
            status: 'processing',
            lastUpdated: now
          };
          
          // 更新单独的任务存储
          localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
          
          return updatedTask;
        }
        return task;
      });
      
      // 更新任务列表存储
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
  };

  // 完成任务
  const completeTask = (id: string, output: string) => {
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            status: 'completed',
            progress: 'Completed',
            output,
            lastUpdated: now
          };
          
          // 更新单独的任务存储
          localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
          
          return updatedTask;
        }
        return task;
      });
      
      // 更新任务列表存储
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
  };

  // 任务失败
  const failTask = (id: string, error: string) => {
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            status: 'failed',
            progress: 'Failed',
            error,
            lastUpdated: now
          };
          
          // 更新单独的任务存储
          localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
          
          return updatedTask;
        }
        return task;
      });
      
      // 更新任务列表存储
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
  };

  // 获取任务详情
  const getTask = (id: string): ProgressTask | null => {
    try {
      const taskJson = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
      if (taskJson) {
        return JSON.parse(taskJson);
      }
    } catch (error) {
      console.error(`Error getting task ${id}:`, error);
    }
    return null;
  };

  // 删除任务
  const removeTask = (id: string) => {
    setActiveTasks(prev => {
      const updatedTasks = prev.filter(task => task.id !== id);
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    
    // 删除单独的任务存储
    localStorage.removeItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
  };

  // 获取特定类型的活动任务
  const getTasksByType = (type: 'livePortrait' | 'voiceCloning' | 'talkingPortrait') => {
    return activeTasks.filter(task => task.type === type);
  };

  // 获取所有处于进行中状态的任务
  const getProcessingTasks = () => {
    return activeTasks.filter(task => task.status === 'pending' || task.status === 'processing');
  };

  // 获取所有已完成的任务
  const getCompletedTasks = () => {
    return activeTasks.filter(task => task.status === 'completed');
  };

  return {
    activeTasks,
    isLoading,
    createTask,
    updateTaskProgress,
    completeTask,
    failTask,
    getTask,
    removeTask,
    getTasksByType,
    getProcessingTasks,
    getCompletedTasks
  };
}; 