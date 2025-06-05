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

  // Load all active tasks from localStorage on initialization
  useEffect(() => {
    const loadTasks = () => {
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
          
          setActiveTasks(filteredTasks);
          
          // Update storage if tasks were filtered out
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
    
    // Set up polling to check active task progress every 3 seconds (reduced from 5)
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
                if (updatedTask.lastUpdated !== task.lastUpdated) {
                  // Task has been updated elsewhere, trigger a full reload
                  loadTasks();
                }
              } catch (e) {
                console.error('Error parsing individual task data:', e);
              }
            }
          });
        }
      } catch (e) {
        console.error('Error checking for task updates:', e);
      }
    }, 3000);
    
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
    console.log(`Marking task ${id} as completed with output:`, output);
    const now = new Date().toISOString();
    
    setActiveTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === id) {
          const updatedTask: ProgressTask = {
            ...task,
            status: 'completed',
            progress: 'Completed',
            output,
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
    
    // Double-check to ensure the task is saved as completed
    setTimeout(() => {
      const taskJson = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`);
      if (taskJson) {
        try {
          const task = JSON.parse(taskJson) as ProgressTask;
          if (task.status !== 'completed') {
            // Force update the task to completed state if not saved properly
            const updatedTask: ProgressTask = {
              ...task,
              status: 'completed',
              progress: 'Completed',
              output,
              lastUpdated: now
            };
            
            localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask));
            
            // Also update the task list
            const tasksJson = localStorage.getItem(TASK_STORAGE_KEY);
            if (tasksJson) {
              const tasks = JSON.parse(tasksJson) as ProgressTask[];
              const updatedTasks = tasks.map(t => t.id === id ? updatedTask : t);
              localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
              
              // Update state
              setActiveTasks(updatedTasks);
            }
          }
        } catch (e) {
          console.error('Error checking task completion status:', e);
        }
      }
    }, 500);
  };

  // Mark a task as failed
  const failTask = (id: string, error: string) => {
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
      console.error(`Error getting task ${id}:`, error);
    }
    return null;
  };

  // Remove a task
  const removeTask = (id: string) => {
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