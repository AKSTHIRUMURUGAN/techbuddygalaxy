'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiDownload, FiEdit2, FiPaperclip, FiTarget, FiX } from 'react-icons/fi';

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
          setUpdateData({
            status: foundTask.status,
            progress: foundTask.progress,
            actualHours: foundTask.actualHours || 0,
          });
        } else {
          alert('Task not found');
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

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
      'In Progress': 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
      'Completed': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      'Overdue': 'bg-red-500/15 text-red-300 border-red-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border-slate-400/30';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-slate-300',
      'Medium': 'text-cyan-300',
      'High': 'text-orange-300',
      'Urgent': 'text-red-300',
    };
    return colors[priority] || 'text-slate-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-300">Task not found</p>
          <Link href="/intern/tasks">
            <button className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-lg">
              Back to Tasks
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <h1 className="text-2xl font-bold">Task Details</h1>
            <Link href="/intern/tasks">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Tasks
              </button>
            </Link>
          </div>

          <div className="p-6 space-y-6">
            {/* Title and Status */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-white">{task.title}</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <p className="text-slate-300 text-lg">{task.description}</p>
            </div>

            {/* Task Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/70 border border-white/10 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Priority</p>
                <p className={`text-xl font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </p>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Progress</p>
                <p className="text-xl font-bold text-slate-100">{task.progress}%</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Deadline</p>
                <p className="text-xl font-bold text-slate-100">
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                </p>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="bg-cyan-500/10 border border-cyan-400/30 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-3 inline-flex items-center"><FiClock className="mr-2" />Time Tracking</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Estimated Hours</p>
                  <p className="text-lg font-bold text-cyan-300">{task.estimatedHours || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Actual Hours</p>
                  <p className="text-lg font-bold text-cyan-300">{task.actualHours || 0}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-cyan-500/15 text-cyan-300 text-sm rounded-full border border-cyan-400/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-2">Attachments</h4>
                <div className="space-y-2">
                  {task.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-900/70 hover:bg-slate-900 rounded-lg transition border border-white/10"
                    >
                      <FiPaperclip className="w-6 h-6 text-cyan-300" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-100">{file.name}</p>
                        <p className="text-xs text-slate-400">
                          {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ''} • 
                          {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                      <FiDownload className="w-5 h-5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback */}
            {task.aiScore && (
            <div className="bg-violet-500/10 border border-violet-400/30 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-2">AI Evaluation</h4>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm text-slate-400">Score:</span>
                  <span className="text-2xl font-bold text-violet-300">{task.aiScore}/10</span>
                </div>
                {task.aiFeedback && (
                  <p className="text-slate-300">{task.aiFeedback}</p>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="bg-slate-900/70 border border-white/10 p-4 rounded-lg">
              <h4 className="font-bold text-white mb-3 inline-flex items-center"><FiCalendar className="mr-2" />Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span className="font-medium text-slate-100">{new Date(task.createdAt).toLocaleString()}</span>
                </div>
                {task.startDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Started:</span>
                    <span className="font-medium text-slate-100">{new Date(task.startDate).toLocaleString()}</span>
                  </div>
                )}
                {task.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed:</span>
                    <span className="font-medium text-slate-100">{new Date(task.completedDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {task.status !== 'Completed' && (
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center"
                >
                  <FiEdit2 className="mr-2" />
                  Update Task
                </button>
              )}
              <Link href="/intern/tasks" className="flex-1">
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition inline-flex items-center justify-center">
                  <FiArrowLeft className="mr-2" />
                  Back to Tasks
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Update Task</h2>
            <p className="text-slate-300 mb-4">{task.title}</p>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={updateData.progress}
                  onChange={(e) => setUpdateData({ ...updateData, progress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Actual Hours Spent
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={updateData.actualHours}
                  onChange={(e) => setUpdateData({ ...updateData, actualHours: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center"
                >
                  <FiTarget className="mr-2" />
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center"
                >
                  <FiX className="mr-2" />
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
