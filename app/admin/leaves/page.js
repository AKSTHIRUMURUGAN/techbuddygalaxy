'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionData, setActionData] = useState({
    status: '',
    rejectionReason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('/api/leaves');
      const data = await response.json();
      
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveId: selectedLeave._id,
          status: actionData.status,
          approvedBy: 'admin',
          rejectionReason: actionData.rejectionReason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Leave ${actionData.status.toLowerCase()} successfully!`);
        setShowModal(false);
        setSelectedLeave(null);
        setActionData({ status: '', rejectionReason: '' });
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error processing leave:', error);
      toast.error('Failed to process leave');
    }
  };

  const openModal = (leave, status) => {
    setSelectedLeave(leave);
    setActionData({ status, rejectionReason: '' });
    setShowModal(true);
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Approved': 'bg-green-100 text-green-800 border-green-300',
      'Rejected': 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-orange-100">Review and approve leave requests</p>
            </div>
            <Link href="/admin">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600 mt-1">Pending</div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-600 mt-1">Approved</div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600 mt-1">Rejected</div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({leaves.length})
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('Approved')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('Rejected')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>

            {/* Leave Requests */}
            <div>
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🏖️</div>
                  <p className="text-xl mb-2">No leave requests</p>
                  <p>Leave requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeaves.map((leave) => (
                    <div
                      key={leave._id}
                      className={`border-2 rounded-lg p-5 ${getStatusColor(leave.status)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{leave.type}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Name:</strong> {leave.userName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Role:</strong> {leave.userRole || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Email:</strong> {leave.userEmail || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Duration:</strong> {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()} ({leave.totalDays} days)
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Applied:</strong> {new Date(leave.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-900">{leave.reason}</p>
                      </div>

                      {leave.attachmentUrl && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-700 mb-2">Attachment:</p>
                          <a
                            href={leave.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View Proof Document
                          </a>
                        </div>
                      )}

                      {leave.status === 'Rejected' && leave.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-900">{leave.rejectionReason}</p>
                        </div>
                      )}

                      {leave.status === 'Pending' && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => openModal(leave, 'Approved')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => openModal(leave, 'Rejected')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {actionData.status} Leave Request
            </h2>
            <div className="mb-4">
              <p className="text-gray-600">
                <strong>{selectedLeave.userName || 'Unknown User'}</strong> ({selectedLeave.userRole || 'N/A'})
              </p>
              <p className="text-sm text-gray-500">{selectedLeave.type}</p>
            </div>

            <form onSubmit={handleAction} className="space-y-4">
              {actionData.status === 'Rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={actionData.rejectionReason}
                    onChange={(e) => setActionData({ ...actionData, rejectionReason: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  className={`flex-1 ${
                    actionData.status === 'Approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white font-bold py-2 px-4 rounded-lg transition`}
                >
                  Confirm {actionData.status}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
