'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiArrowLeft, FiBriefcase, FiEdit2, FiLoader, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

export default function PositionsAdminPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [newPosition, setNewPosition] = useState({
    title: '',
    description: ''
  });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPositions();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/verify-admin');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/get-positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPosition = async () => {
    if (!newPosition.title.trim()) {
      toast.error('Please enter a position title');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/get-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPosition),
      });

      if (response.ok) {
        await fetchPositions();
        setShowAddModal(false);
        setNewPosition({ title: '', description: '' });
        toast.success('Position added successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Network error occurred');
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (position) => {
    setEditingPosition({
      id: position.id,
      title: position.title,
      description: position.description || ''
    });
    setShowEditModal(true);
  };

  const updatePosition = async () => {
    if (!editingPosition.title.trim()) {
      toast.error('Please enter a position title');
      return;
    }

    setEditing(true);
    try {
      const response = await fetch('/api/get-positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPosition),
      });

      if (response.ok) {
        await fetchPositions();
        setShowEditModal(false);
        setEditingPosition(null);
        toast.success('Position updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error('Network error occurred');
    } finally {
      setEditing(false);
    }
  };

  const deletePosition = async (position) => {
    if (!confirm(`Are you sure you want to delete "${position.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(position.id);
    try {
      const response = await fetch(`/api/get-positions?id=${position.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPositions();
        toast.success('Position deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error('Network error occurred');
    } finally {
      setDeleting(null);
    }
  };

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/admin/applications';
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Position Management</h1>
              <p className="text-indigo-100">Manage available positions for applications and documents</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition duration-200 flex items-center border border-white/20"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Position
              </button>
              <a
                href="/admin/applications"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition duration-200 flex items-center border border-white/20"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Applications
              </a>
            </div>
          </div>

          {/* Positions Grid */}
          <div className="p-6">
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <FiBriefcase className="text-6xl mb-4 mx-auto text-slate-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No Positions Available</h3>
                <p className="text-slate-400">Add your first position to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {positions.map((position) => (
                  <div key={position.id} className="bg-slate-900/60 border border-indigo-400/30 hover:border-indigo-300/60 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{position.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {position.description || 'No description provided'}
                    </p>
                    
                    {position.createdAt && (
                      <div className="text-xs text-slate-400 mb-4">
                        <strong>Added:</strong> {new Date(position.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => openEditModal(position)}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          <FiEdit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => deletePosition(position)}
                          disabled={deleting === position.id}
                          className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          {deleting === position.id ? (
                            <>
                              <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <FiTrash2 className="w-4 h-4 mr-2" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Position Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full">
              <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Position</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-slate-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    value={newPosition.title}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPosition.description}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Brief description of this position..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={addPosition}
                    disabled={adding || !newPosition.title.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {adding ? 'Adding...' : 'Add Position'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={adding}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Position Modal */}
        {showEditModal && editingPosition && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full">
              <div className="bg-cyan-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Position</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPosition(null);
                  }}
                  className="text-white hover:text-slate-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    value={editingPosition.title}
                    onChange={(e) => setEditingPosition(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingPosition.description}
                    onChange={(e) => setEditingPosition(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows="3"
                    placeholder="Brief description of this position..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={updatePosition}
                    disabled={editing || !editingPosition.title.trim()}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {editing ? 'Updating...' : 'Update Position'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPosition(null);
                    }}
                    disabled={editing}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

