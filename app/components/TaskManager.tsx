'use client';

import React, { useState, useEffect } from 'react';
import { useProgressTracking, ProgressTask } from '../../lib/useProgressTracking';
import LoadingState from './LoadingState';

export default function TaskManager() {
  const { 
    activeTasks, 
    isLoading, 
    getProcessingTasks, 
    getCompletedTasks,
    removeTask 
  } = useProgressTracking();
  
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'completed'>('all');
  const [filteredTasks, setFilteredTasks] = useState<ProgressTask[]>([]);
  
  // 根据视图模式过滤任务
  useEffect(() => {
    if (viewMode === 'active') {
      setFilteredTasks(getProcessingTasks());
    } else if (viewMode === 'completed') {
      setFilteredTasks(getCompletedTasks());
    } else {
      setFilteredTasks(activeTasks);
    }
  }, [viewMode, activeTasks, getProcessingTasks, getCompletedTasks]);
  
  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // 获取任务类型的友好名称
  const getTaskTypeName = (type: string) => {
    switch (type) {
      case 'livePortrait': return 'Live Portrait Animation';
      case 'voiceCloning': return 'Voice Cloning';
      case 'talkingPortrait': return 'Talking Portrait';
      default: return type;
    }
  };
  
  // 获取任务状态的友好名称和颜色
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { name: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { name: 'Processing', color: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { name: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'failed':
        return { name: 'Failed', color: 'bg-red-100 text-red-800' };
      default:
        return { name: status, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // 打开结果
  const openResult = (task: ProgressTask) => {
    if (task.output) {
      window.open(task.output, '_blank');
    }
  };
  
  // 删除任务
  const handleRemoveTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this task?')) {
      removeTask(id);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <LoadingState type="spinner" message="Loading tasks..." />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Tasks</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('active')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-3 py-1 text-sm rounded-md ${
              viewMode === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No tasks found.</p>
          <p className="text-gray-400 text-sm mt-2">
            {viewMode === 'all'
              ? 'You don\'t have any tasks yet.'
              : viewMode === 'active'
              ? 'You don\'t have any active tasks.'
              : 'You don\'t have any completed tasks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                task.status === 'completed' ? 'border-green-200 bg-green-50' : 
                task.status === 'failed' ? 'border-red-200 bg-red-50' : 
                'border-blue-200 bg-blue-50'
              }`}
              onClick={() => task.status === 'completed' && openResult(task)}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{getTaskTypeName(task.type)}</h3>
                  <p className="text-sm text-gray-500">
                    Started: {formatDate(task.startTime)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusInfo(task.status).color}`}>
                    {getStatusInfo(task.status).name}
                  </span>
                  <button 
                    onClick={(e) => handleRemoveTask(task.id, e)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-sm">
                  {task.status === 'processing' || task.status === 'pending' ? (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>{task.progress}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  ) : task.status === 'failed' ? (
                    <div className="text-red-600">{task.error || 'An error occurred'}</div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">Completed successfully</span>
                      {task.output && (
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700">
                          View Result
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 