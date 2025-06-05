'use client';

import { useState, useEffect } from 'react';

// Local storage key prefix
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

  // Helper function to sync a specific task
  const syncTask = (taskId: string) => {
    console.log(`[TaskSync] Syncing task ${taskId}`);
    try {
      // Get the individual task data
      const taskJson = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${taskId}`);
      if (!taskJson) {
        console.log(`[TaskSync] No data found for task ${taskId}`);
        return;
      }
      
      // Parse the task
      const task = JSON.parse(taskJson) as ProgressTask;
      
      // Get the task list
      const tasksJson = localStorage.getItem(TASK_STORAGE_KEY);
      if (!tasksJson) {
        console.log(`[TaskSync] No task list found, creating new one with task ${taskId}`);
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify([task]));
        setActiveTasks([task]);
        return;
      }
      
      // Parse the task list
      const tasks = JSON.parse(tasksJson) as ProgressTask[];
      
      // Find the task in the list
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex >= 0) {
        // Task exists in list, update it
        tasks[taskIndex] = task;
        console.log(`[TaskSync] Updated task ${taskId} in list, status: ${task.status}`);
      } else {
        // Task doesn't exist, add it
        tasks.push(task);
        console.log(`[TaskSync] Added task ${taskId} to list, status: ${task.status}`);
      }
      
      // Save the updated list
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
      setActiveTasks(tasks);
    } catch (error) {
      console.error(`[TaskSync] Error syncing task ${taskId}:`, error);
    }
  };

  // Load all active tasks from localStorage on initialization
  useEffect(() => {
    const loadTasks = () => {
      console.log('[TaskTracker] Loading tasks from localStorage');
      try {
        const tasksJson = localStorage.getItem(TASK_STORAGE_KEY);
        if (tasksJson) {
          const tasks = JSON.parse(tasksJson) as ProgressTask[];
          
          // Filter out tasks older than 24 hours
          const filteredTasks = tasks.filter(task => {
            const lastUpdated = new Date(task.lastUpdated).getTime();
            const now = new Date().getTime();
            const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);
            return hoursDiff < 24;
          });
          
          console.log(`[TaskTracker] Loaded ${filteredTasks.length} tasks`);
          
          // Check each task individually for updates
          for (const task of filteredTasks) {
            const taskKey = `${PROGRESS_STORAGE_KEY_PREFIX}${task.id}`;
            const individualTaskJson = localStorage.getItem(taskKey);
            
            if (individualTaskJson) {
              try {
                const individualTask = JSON.parse(individualTaskJson) as ProgressTask;
                
                // If the individual task is more up to date, use that data
                if (new Date(individualTask.lastUpdated) > new Date(task.lastUpdated)) {
                  console.log(`[TaskTracker] Task ${task.id} has been updated since last load`);
                  
                  // Update the task in the filtered list
                  const taskIndex = filteredTasks.findIndex(t => t.id === task.id);
                  if (taskIndex >= 0) {
                    filteredTasks[taskIndex] = individualTask;
                  }
                }
              } catch (e) {
                console.error(`[TaskTracker] Error parsing individual task ${task.id}:`, e);
              }
            }
          }
          
          setActiveTasks(filteredTasks);
          
          // Update storage if tasks were filtered out
          if (filteredTasks.length !== tasks.length) {
            console.log(`[TaskTracker] Filtered out ${tasks.length - filteredTasks.length} old tasks`);
            localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(filteredTasks));
          }
        } else {
          console.log('[TaskTracker] No tasks found in localStorage');
          setActiveTasks([]);
        }
      } catch (error) {
        console.error('[TaskTracker] Error loading tasks from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
    
    // Set up polling to check active task progress every 2 seconds (reduced from 3)
    const intervalId = setInterval(() => {
      loadTasks();
      
      // Explicitly check for individual task updates
      try {
        const tasksJson = localStorage.getItem(TASK_STORAGE_KEY);
        if (tasksJson) {
          const tasks = JSON.parse(tasksJson) as ProgressTask[];
          
          // For each task, check if there's an individual update
          tasks.forEach(task => {
            const taskKey = `${PROGRESS_STORAGE_KEY_PREFIX}${task.id}`;
            const individualTaskJson = localStorage.getItem(taskKey);
            
            if (individualTaskJson) {
              try {
                const updatedTask = JSON.parse(individualTaskJson) as ProgressTask;
                if (updatedTask.lastUpdated !== task.lastUpdated || updatedTask.status !== task.status) {
                  // Task has been updated elsewhere, sync it
                  console.log(`[TaskTracker] Task ${task.id} has changed, syncing...`);
                  syncTask(task.id);
                }
              } catch (e) {
                console.error('[TaskTracker] Error parsing individual task data:', e);
              }
            }
          });
        }
      } catch (e) {
        console.error('[TaskTracker] Error checking for task updates:', e);
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Create a new task
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
    
    console.log(`[TaskTracker] Creating new task ${id} of type ${type}`);
    
    // Update active tasks in memory
    setActiveTasks(prev => {
      const updatedTasks = [...prev, newTask];
      // Save to localStorage
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    
    // Save task details separately for quick access
    localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(newTask));
    
    return newTask;
  };

  // Update task progress
  const updateTaskProgress = (id: string, progress: string) => {
    console.log(`[TaskTracker] Updating progress for task ${id}: ${progress}`);
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask: ProgressTask = {
            ...task,
            progress,
            status: 'processing',
            lastUpdated: now
          };
          
          // Update individual task storage
          localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
          
          return updatedTask;
        }
        return task;
      });
      
      // Update task list storage
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
  };

  // Complete a task
  const completeTask = (id: string, output: string) => {
    console.log(`[TaskTracker] Marking task ${id} as completed with output URL length: ${output.length}`);
    const now = new Date().toISOString();
    
    const updatedTask: ProgressTask = {
      // Default values in case the task doesn't exist yet
      id,
      type: 'livePortrait',
      startTime: now,
      // Set completion values
      status: 'completed',
      progress: 'Completed',
      output,
      lastUpdated: now
    };
    
    // Get existing task to preserve other properties
    const taskJson = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
    if (taskJson) {
      try {
        const existingTask = JSON.parse(taskJson) as ProgressTask;
        // Merge existing task data with completion data
        Object.assign(updatedTask, existingTask, {
          status: 'completed',
          progress: 'Completed',
          output,
          lastUpdated: now
        });
      } catch (e) {
        console.error(`[TaskTracker] Error parsing existing task ${id}:`, e);
      }
    }
    
    // Update individual task storage first
    localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
    
    // Update task list
    setActiveTasks(prev => {
      // Find if task exists in list
      const taskIndex = prev.findIndex(task => task.id === id);
      
      let updatedTasks;
      if (taskIndex >= 0) {
        // Task exists, update it
        updatedTasks = [...prev];
        updatedTasks[taskIndex] = updatedTask;
      } else {
        // Task doesn't exist, add it
        updatedTasks = [...prev, updatedTask];
      }
      
      // Update task list storage
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
    
    // Double-check and force sync the task after a delay
    setTimeout(() => {
      syncTask(id);
    }, 1000);
  };

  // Mark a task as failed
  const failTask = (id: string, error: string) => {
    console.log(`[TaskTracker] Marking task ${id} as failed: ${error}`);
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask: ProgressTask = {
            ...task,
            status: 'failed',
            progress: 'Failed',
            error,
            lastUpdated: now
          };
          
          // Update individual task storage
          localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
          
          return updatedTask;
        }
        return task;
      });
      
      // Update task list storage
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      
      return updatedTasks;
    });
  };

  // Get task details
  const getTask = (id: string): ProgressTask | null => {
    try {
      const taskJson = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
      if (taskJson) {
        return JSON.parse(taskJson) as ProgressTask;
      }
    } catch (error) {
      console.error(`[TaskTracker] Error getting task ${id}:`, error);
    }
    return null;
  };

  // Remove a task
  const removeTask = (id: string) => {
    console.log(`[TaskTracker] Removing task ${id}`);
    setActiveTasks(prev => {
      const updatedTasks = prev.filter(task => task.id !== id);
      localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
      return updatedTasks;
    });
    
    // Delete individual task storage
    localStorage.removeItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
  };

  // Get tasks by type
  const getTasksByType = (type: 'livePortrait' | 'voiceCloning' | 'talkingPortrait') => {
    return activeTasks.filter(task => task.type === type);
  };

  // Get all tasks that are in progress
  const getProcessingTasks = () => {
    return activeTasks.filter(task => task.status === 'pending' || task.status === 'processing');
  };

  // Get all completed tasks
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