'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [interns, setInterns] = useState([]);
  const [assigningTask, setAssigningTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium',
    tags: '',
    estimatedHours: '',
    attachments: [],
  });

  useEffect(() => {
    fetchTasks();
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      const response = await fetch('/api/users?role=intern');
      const data = await response.json();
      if (data.success) {
        setInterns(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assignedTo: formData.assignedTo || null, // Allow null for unassigned
          createdBy: 'admin',
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Task created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          assignedTo: '',
          deadline: '',
          priority: 'Medium',
          tags: '',
          estimatedHours: '',
          attachments: [],
        });
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task._id);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      tags: task.tags ? task.tags.join(', ') : '',
      estimatedHours: task.estimatedHours || '',
    });
  };

  const handleUpdateTask = async (taskId) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          ...editFormData,
          tags: editFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
          estimatedHours: editFormData.estimatedHours ? parseFloat(editFormData.estimatedHours) : null,
          deadline: editFormData.deadline ? new Date(editFormData.deadline) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Task updated successfully!');
        setEditingTask(null);
        setEditFormData({});
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleFileUpload = async (taskId, files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [taskId]: true }));

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      formData.append('taskId', taskId);

      const response = await fetch('/api/tasks/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Files uploaded successfully!');
        fetchTasks();
      } else {
        toast.error('Failed to upload files: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const assignTask = async (taskId, userId) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          assignedTo: userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Task assigned successfully!');
        setAssigningTask(null);
        setSearchTerm('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };

  const getInternName = (userId) => {
    const intern = interns.find(i => i._id === userId);
    return intern ? intern.name : userId;
  };

  const filteredInterns = interns.filter(intern =>
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Task Management</h1>
              <p className="text-blue-100">Create and manage intern tasks</p>
            </div>
            <Link href="/admin">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-gray-700">
                <span className="font-semibold">{tasks.length}</span> total tasks
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition flex items-center"
              >
                <span className="text-xl mr-2">+</span>
                Create New Task
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter task title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To (Optional)
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {interns.map((intern) => (
                          <option key={intern._id} value={intern._id}>
                            {intern.name} ({intern.email})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Leave unassigned to assign later</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="design, urgent, frontend"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter task description..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Create Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl mb-2">No tasks found</p>
                  <p>Create your first task to get started</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    {editingTask === task._id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={editFormData.title}
                              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={editFormData.description}
                              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                              rows="3"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                              value={editFormData.priority}
                              onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                            <input
                              type="datetime-local"
                              value={editFormData.deadline}
                              onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                            <input
                              type="number"
                              step="0.5"
                              value={editFormData.estimatedHours}
                              onChange={(e) => setEditFormData({ ...editFormData, estimatedHours: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                              type="text"
                              value={editFormData.tags}
                              onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="design, urgent, frontend"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateTask(task._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Edit task"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">Assigned To:</span>
                            {task.assignedTo ? (
                              <p className="font-medium">{getInternName(task.assignedTo)}</p>
                            ) : (
                              <p className="font-medium text-orange-600">Unassigned</p>
                            )}
                          </div>
                          <div>
                            <span className="text-gray-500">Priority:</span>
                            <p className={`font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Progress:</span>
                            <p className="font-medium">{task.progress}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Deadline:</span>
                            <p className="font-medium">
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {task.attachments && task.attachments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {task.attachments.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  {file.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {!task.assignedTo && (
                            <div className="relative flex-1 min-w-[200px]">
                              {assigningTask === task._id ? (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Assign to Intern</span>
                                    <button
                                      onClick={() => {
                                        setAssigningTask(null);
                                        setSearchTerm('');
                                      }}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                  />
                                  <div className="max-h-48 overflow-y-auto">
                                    {filteredInterns.length === 0 ? (
                                      <p className="text-sm text-gray-500 py-2">No interns found</p>
                                    ) : (
                                      filteredInterns.map((intern) => (
                                        <button
                                          key={intern._id}
                                          onClick={() => assignTask(task._id, intern._id)}
                                          className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded transition flex items-center justify-between"
                                        >
                                          <div>
                                            <p className="text-sm font-medium text-gray-900">{intern.name}</p>
                                            <p className="text-xs text-gray-500">{intern.email}</p>
                                          </div>
                                          <span className="text-xs text-gray-400">{intern.department}</span>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningTask(task._id)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  Assign Task
                                </button>
                              )}
                            </div>
                          )}
                          
                          <div>
                            <input
                              type="file"
                              id={`file-${task._id}`}
                              multiple
                              onChange={(e) => handleFileUpload(task._id, e.target.files)}
                              className="hidden"
                            />
                            <label
                              htmlFor={`file-${task._id}`}
                              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
                                uploadingFiles[task._id]
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {uploadingFiles[task._id] ? 'Uploading...' : 'Add Files'}
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

