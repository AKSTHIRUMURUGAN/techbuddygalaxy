'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiArrowLeft, FiCheckCircle, FiClock, FiEdit2, FiList, FiTarget, FiX } from 'react-icons/fi';

export default function InternTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    progress: 0,
    actualHours: 0,
    note: '',
  });

  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/intern-auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchTasks(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
          taskId: selectedTask._id,
          status: updateData.status,
          progress: parseInt(updateData.progress),
          actualHours: parseFloat(updateData.actualHours),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Task updated successfully!');
        setShowUpdateModal(false);
        if (user) fetchTasks(user.id);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setUpdateData({
      status: task.status,
      progress: task.progress,
      actualHours: task.actualHours || 0,
      note: '',
    });
    setShowUpdateModal(true);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

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
          <p className="text-slate-300">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-violet-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Tasks</h1>
              <p className="text-cyan-100">Manage your assigned tasks</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pending ({tasks.filter(t => t.status === 'Pending').length})
              </button>
              <button
                onClick={() => setFilter('In Progress')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'In Progress'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                In Progress ({tasks.filter(t => t.status === 'In Progress').length})
              </button>
              <button
                onClick={() => setFilter('Completed')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Completed ({tasks.filter(t => t.status === 'Completed').length})
              </button>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FiList className="text-6xl mb-4 mx-auto text-slate-500" />
                <p className="text-xl mb-2">No tasks found</p>
                <p>Tasks will appear here when assigned to you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`border rounded-xl p-5 hover:shadow-lg transition bg-slate-900/50 ${getStatusColor(task.status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{task.title}</h3>
                        <p className="text-slate-300">{task.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-400">Priority:</span>
                        <p className={`font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Progress:</span>
                        <p className="font-bold text-slate-100">{task.progress}%</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Estimated:</span>
                        <p className="font-bold text-slate-100">{task.estimatedHours || 'N/A'}h</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Deadline:</span>
                        <p className="font-bold text-slate-100">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-slate-800 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-cyan-500/15 text-cyan-300 text-xs rounded-full border border-cyan-400/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Feedback */}
                    {task.aiScore && (
                      <div className="bg-slate-950/70 rounded-lg p-3 mb-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">AI Score:</span>
                          <span className="text-lg font-bold text-violet-300">{task.aiScore}/10</span>
                        </div>
                        {task.aiFeedback && (
                          <p className="text-sm text-slate-300 mt-2">{task.aiFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex gap-3">
                      <Link href={`/intern/tasks/${task._id}`} className="flex-1">
                        <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center">
                          <FiList className="mr-2" />
                          View Full Details
                        </button>
                      </Link>
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => openUpdateModal(task)}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center"
                        >
                          <FiEdit2 className="mr-2" />
                          Update Task
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Update Task</h2>
            <p className="text-slate-300 mb-4">{selectedTask.title}</p>

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
                  <FiCheckCircle className="mr-2" />
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
