'use client';

import { useState, useEffect } from 'react';

export default function PositionsAdminPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: '',
    description: ''
  });
  const [adding, setAdding] = useState(false);
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
      alert('Please enter a position title');
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
        alert('Position added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding position:', error);
      alert('Network error occurred');
    } finally {
      setAdding(false);
    }
  };

  const deletePosition = async (position) => {
    if (position.isDefault) {
      alert('Cannot delete default positions');
      return;
    }

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
        alert('Position deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting position:', error);
      alert('Network error occurred');
    } finally {
      setDeleting(null);
    }
  };

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Position Management</h1>
              <p className="text-indigo-100">Manage available positions for applications and documents</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Position
              </button>
              <a
                href="/admin/applications"
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Applications
              </a>
            </div>
          </div>

          {/* Positions Grid */}
          <div className="p-6">
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Positions Available</h3>
                <p className="text-gray-500">Add your first position to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {positions.map((position) => (
                  <div key={position.id} className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow ${
                    position.isDefault 
                      ? 'border-blue-200 hover:border-blue-300' 
                      : 'border-indigo-200 hover:border-indigo-300'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{position.title}</h3>
                          {position.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                          {!position.isDefault && (
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {position.description || 'No description provided'}
                    </p>
                    
                    {position.createdAt && (
                      <div className="text-xs text-gray-500 mb-4">
                        <strong>Added:</strong> {new Date(position.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-end">
                        {!position.isDefault && (
                          <button
                            onClick={() => deletePosition(position)}
                            disabled={deleting === position.id}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
                          >
                            {deleting === position.id ? (
                              <>
                                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        )}
                        {position.isDefault && (
                          <span className="text-sm text-gray-500 italic">Default position</span>
                        )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Position</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    value={newPosition.title}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPosition.description}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-200"
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