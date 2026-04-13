'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiArrowLeft, FiCheckCircle, FiLoader, FiPaperclip, FiPlus, FiX } from 'react-icons/fi';

export default function InternLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: '',
  });
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
        fetchLeaves(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchLeaves = async (userId) => {
    try {
      const response = await fetch(`/api/leaves?userId=${userId}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || uploadingFile) return;

    try {
      setUploadingFile(true);
      let attachmentUrl = null;

      // Upload file if selected
      if (selectedFile) {
        const fileFormData = new FormData();
        fileFormData.append('file', selectedFile);

        const uploadResponse = await fetch('/api/upload-file', {
          method: 'POST',
          body: fileFormData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          attachmentUrl = uploadData.url;
        }
      }

      // Submit leave request
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          attachmentUrl,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Leave request submitted successfully!');
        setShowApplyForm(false);
        setFormData({
          type: 'Sick Leave',
          fromDate: '',
          toDate: '',
          reason: '',
        });
        setSelectedFile(null);
        fetchLeaves(user.id);
      } else {
        toast.error(data.error || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max for leave proof)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
      'Approved': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      'Rejected': 'bg-red-500/15 text-red-300 border-red-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border-slate-400/30';
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Leave Management</h1>
              <p className="text-amber-100">Apply and track your leave requests</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-slate-300">
                <span className="font-semibold">{leaves.length}</span> total leave requests
              </div>
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition flex items-center"
              >
                <FiPlus className="text-lg mr-2" />
                Apply for Leave
              </button>
            </div>

            {/* Apply Form */}
            {showApplyForm && (
              <div className="bg-amber-500/10 p-6 rounded-xl mb-6 border border-amber-400/30">
                <h3 className="text-lg font-semibold mb-4 text-white">Apply for Leave</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Leave Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        From Date *
                      </label>
                      <input
                        type="date"
                        value={formData.fromDate}
                        onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        To Date *
                      </label>
                      <input
                        type="date"
                        value={formData.toDate}
                        onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Reason *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows="4"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Please provide a reason for your leave..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Proof Document (Optional)
                    </label>
                    <p className="text-xs text-slate-400 mb-2">
                      Upload medical certificate, proof, or supporting document (Max 10MB)
                    </p>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {selectedFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                        <FiPaperclip className="w-4 h-4" />
                        <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FiX />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={uploadingFile}
                      className="bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                    >
                      {uploadingFile ? (
                        <>
                          <FiLoader className="animate-spin w-4 h-4" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Leave Requests */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Your Leave Requests</h2>
              
              {leaves.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">🏖️</div>
                  <p className="text-xl mb-2">No leave requests yet</p>
                  <p>Apply for leave when you need time off</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaves.map((leave) => (
                    <div
                      key={leave._id}
                      className={`border-2 rounded-lg p-5 ${getStatusColor(leave.status)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white">{leave.type}</h3>
                          <p className="text-sm text-slate-300 mt-1">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-300">
                            Duration: {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                          </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                      </div>

                      <div className="bg-slate-900/70 rounded-lg p-3 mb-3 border border-white/10">
                        <p className="text-sm font-medium text-slate-300 mb-1">Reason:</p>
                        <p className="text-sm text-slate-100">{leave.reason}</p>
                      </div>

                      {leave.attachmentUrl && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm font-medium text-blue-700 mb-2">Proof Document:</p>
                          <a
                            href={leave.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <FiPaperclip className="w-4 h-4" />
                            View Attached Document
                          </a>
                        </div>
                      )}

                      {leave.status === 'Rejected' && leave.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-900">{leave.rejectionReason}</p>
                        </div>
                      )}

                      {leave.status === 'Approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700">
                            <span className="inline-flex items-center gap-1"><FiCheckCircle /> Approved on {new Date(leave.approvedAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-slate-400">
                        Applied on: {new Date(leave.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
