'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FiArrowLeft, FiCheck, FiPaperclip, FiX } from 'react-icons/fi';

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
      'Pending': 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
      'Approved': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      'Rejected': 'bg-red-500/15 text-red-300 border-red-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border-slate-400/30';
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-amber-100">Review and approve leave requests</p>
            </div>
            <Link href="/admin">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">{stats.pending}</div>
                <div className="text-sm text-slate-300 mt-1">Pending</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-300">{stats.approved}</div>
                <div className="text-sm text-slate-300 mt-1">Approved</div>
              </div>
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-300">{stats.rejected}</div>
                <div className="text-sm text-slate-300 mt-1">Rejected</div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({leaves.length})
              </button>
              <button
                onClick={() => setFilter('Pending')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('Approved')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('Rejected')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'Rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>

            {/* Leave Requests */}
            <div>
              {filteredLeaves.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">📨</div>
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
                            <h3 className="text-lg font-bold text-white">{leave.type}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(leave.status)}`}>
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-1">
                            <strong>Name:</strong> {leave.userName || 'Unknown User'}
                          </p>
                          <p className="text-sm text-slate-300 mb-1">
                            <strong>Role:</strong> {leave.userRole || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-300 mb-1">
                            <strong>Email:</strong> {leave.userEmail || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-300 mb-1">
                            <strong>Duration:</strong> {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()} ({leave.totalDays} days)
                          </p>
                          <p className="text-sm text-slate-300">
                            <strong>Applied:</strong> {new Date(leave.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/70 rounded-lg p-3 mb-3 border border-white/10">
                        <p className="text-sm font-medium text-slate-300 mb-1">Reason:</p>
                        <p className="text-sm text-slate-100">{leave.reason}</p>
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
                            <FiPaperclip className="w-4 h-4" />
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
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center"
                          >
                            <FiCheck className="mr-2" /> Approve
                          </button>
                          <button
                            onClick={() => openModal(leave, 'Rejected')}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition inline-flex items-center justify-center"
                          >
                            <FiX className="mr-2" /> Reject
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {actionData.status} Leave Request
            </h2>
            <div className="mb-4">
              <p className="text-slate-300">
                <strong>{selectedLeave.userName || 'Unknown User'}</strong> ({selectedLeave.userRole || 'N/A'})
              </p>
              <p className="text-sm text-slate-400">{selectedLeave.type}</p>
            </div>

            <form onSubmit={handleAction} className="space-y-4">
              {actionData.status === 'Rejected' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Rejection Reason (Optional)
                  </label>
                  <textarea
                    value={actionData.rejectionReason}
                    onChange={(e) => setActionData({ ...actionData, rejectionReason: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition"
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
