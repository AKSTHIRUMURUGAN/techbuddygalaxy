'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function TaskDetailsPage() {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    progress: 0,
    actualHours: 0,
  });

  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/intern-auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchTask(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchTask = async (userId) => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        const foundTask = data.tasks.find(t => t._id === taskId);
        if (foundTask) {
          setTask(foundTask);
        } else {
          alert('Task not found or you do not have access to this task');
          router.push('/intern/tasks');
        }
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          status: updateData.status,
          progress: parseInt(updateData.progress),
          actualHours: parseFloat(updateData.actualHours),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Task updated successfully!');
        setShowUpdateModal(false);
        if (user) fetchTask(user.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const openUpdateModal = () => {
    setUpdateData({
      status: task.status,
      progress: task.progress,
      actualHours: task.actualHours || 0,
    });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
      'Completed': 'bg-green-100 text-green-800 border-green-300',
      'Overdue': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-gray-600',
      'Medium': 'text-blue-600',
      'High': 'text-orange-600',
      'Urgent': 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h1>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/intern/tasks">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
              Go to My Tasks
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Task Details</h1>
              <p className="text-blue-100">Complete task information</p>
            </div>
            <Link href="/intern/tasks">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
                Back to Tasks
              </button>
            </Link>
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Status */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{task.title}</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-gray-700 text-lg mt-3">{task.description}</p>
            </div>

            {/* Task Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 mb-1 font-medium">Priority</p>
                <p className={`text-2xl font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-1 font-medium">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{task.progress}%</p>
                <div className="w-full bg-blue-200 rounded-full h-3 mt-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 mb-1 font-medium">Deadline</p>
                <p className="text-2xl font-bold text-gray-900">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </p>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Tracking
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-green-700 mb-1">Estimated Hours</p>
                  <p className="text-3xl font-bold text-green-600">{task.estimatedHours || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 mb-1">Actual Hours</p>
                  <p className="text-3xl font-bold text-green-600">{task.actualHours || 0}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Attachments
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                    >
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''} • 
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {task.aiScore && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">AI Evaluation</h3>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="text-3xl font-bold text-purple-600">{task.aiScore}/10</span>
                </div>
                {task.aiFeedback && (
                  <p className="text-gray-700 leading-relaxed">{task.aiFeedback}</p>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-600 font-medium">Created:</span>
                  <span className="font-semibold text-gray-900">{new Date(task.createdAt).toLocaleString()}</span>
                </div>
                {task.startDate && (
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <span className="text-gray-600 font-medium">Started:</span>
                    <span className="font-semibold text-gray-900">{new Date(task.startDate).toLocaleString()}</span>
                  </div>
                )}
                {task.completedDate && (
                  <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <span className="text-gray-600 font-medium">Completed:</span>
                    <span className="font-semibold text-gray-900">{new Date(task.completedDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {task.status !== 'Completed' && (
                <button
                  onClick={openUpdateModal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
                >
                  Update Task Status
                </button>
              )}
              <Link href="/intern/tasks" className="flex-1">
                <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 rounded-lg transition text-lg">
                  Back to All Tasks
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Update Task</h2>
            <p className="text-gray-600 mb-4">{task.title}</p>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={updateData.progress}
                  onChange={(e) => setUpdateData({ ...updateData, progress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Hours Spent
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={updateData.actualHours}
                  onChange={(e) => setUpdateData({ ...updateData, actualHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
