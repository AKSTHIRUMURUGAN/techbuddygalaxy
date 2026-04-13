'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ApplicationsAdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const [templates, setTemplates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateData, setTemplateData] = useState({});
  const [manualFields, setManualFields] = useState([]);
  const [deletingApplication, setDeletingApplication] = useState(null);
  const [givingAccess, setGivingAccess] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
      fetchTemplates();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setLoginForm({ username: '', password: '' });
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error occurred');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setApplications([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/get-applications');
      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setApplications(data.applications || []);
          } catch (parseError) {
            console.error('Error parsing applications JSON:', parseError);
            setApplications([]);
          }
        } else {
          setApplications([]);
        }
      } else {
        console.error('Failed to fetch applications:', response.status);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/get-templates');
      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setTemplates(data.templates || []);
          } catch (parseError) {
            console.error('Error parsing templates JSON:', parseError);
            setTemplates([]);
          }
        } else {
          setTemplates([]);
        }
      } else {
        console.error('Failed to fetch templates:', response.status);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/get-positions');
      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            setPositions(data.positions || []);
          } catch (parseError) {
            console.error('Error parsing positions JSON:', parseError);
            setPositions([]);
          }
        } else {
          setPositions([]);
        }
      } else {
        console.error('Failed to fetch positions:', response.status);
        setPositions([]);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    }
  };

  const updateApplicationStatus = async (applicationId, status, message = '') => {
    setStatusUpdating(true);
    try {
      const response = await fetch('/api/update-application-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          message
        }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          try {
            JSON.parse(text); // Validate JSON
          } catch (parseError) {
            console.error('Invalid JSON response:', parseError);
          }
        }
        // Refresh applications list
        await fetchApplications();
        setShowStatusModal(false);
        setStatusMessage('');
        toast.success(`Application ${status} successfully!`);
      } else {
        const text = await response.text();
        let errorMessage = 'Unknown error';
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error;
          } catch (parseError) {
            errorMessage = `Server error: ${response.status}`;
          }
        }
        toast.error(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error occurred');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleStatusAction = (application, action) => {
    setSelectedApplication(application);
    setStatusAction(action);
    setShowStatusModal(true);
    setStatusMessage('');
  };

  const generateDocument = async (application, templateId) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      // Use the new mapping-based generation API
      const response = await fetch('/api/generate-with-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          templateUrl: template.url,
          applicationId: application.applicationId,
          customData: templateData // Any manual data entered
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Send document via email
        await fetch('/api/send-document-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: application.applicationId,
            documentType: template.type,
            documentUrl: result.documentUrl,
            templateTitle: template.title
          }),
        });

        toast.success(`${template.title} generated and sent successfully!`);
        setShowTemplateModal(false);
        setTemplateData({});
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Network error occurred');
    }
  };

  const handleSendDocument = async (application) => {
    setSelectedApplication(application);
    setShowTemplateModal(true);
    setSelectedTemplate('');
    setTemplateData({});
    setManualFields([]);
  };

  const handleTemplateSelection = async (templateId) => {
    setSelectedTemplate(templateId);
    setManualFields([]);
    setTemplateData({});

    if (!templateId) return;

    try {
      // Load field mappings for this template to find manual fields
      const response = await fetch(`/api/save-template-mapping?templateId=${templateId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.mapping && data.mapping.fieldMappings) {
          // Find fields that are mapped as "custom" (manual entry)
          const customFields = Object.entries(data.mapping.fieldMappings)
            .filter(([placeholder, schemaKey]) => schemaKey === 'custom')
            .map(([placeholder]) => placeholder);
          
          setManualFields(customFields);
        }
      }
    } catch (error) {
      console.error('Error loading template mappings:', error);
    }
  };

  const deleteApplication = async (applicationId, applicantName) => {
    if (!confirm(`Are you sure you want to delete the application from "${applicantName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingApplication(applicationId);
    try {
      const response = await fetch(`/api/delete-application/${applicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh applications list
        await fetchApplications();
        toast.success('Application deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Network error occurred');
    } finally {
      setDeletingApplication(null);
    }
  };

  const giveInternAccess = async (applicationId, applicantName) => {
    if (!confirm(`Create intern account and send login credentials to "${applicantName}"?`)) {
      return;
    }

    setGivingAccess(applicationId);
    try {
      const response = await fetch('/api/give-intern-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Intern account created successfully! Login credentials have been sent via email.');
        await fetchApplications();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error giving intern access:', error);
      toast.error('Network error occurred');
    } finally {
      setGivingAccess(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadResume = (applicationId, originalName) => {
    const link = document.createElement('a');
    link.href = `/api/download-resume/${applicationId}`;
    link.download = originalName || 'resume.pdf';
    link.click();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300 tracking-wide">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none"></div>
        <div className="max-w-md w-full relative z-10">
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl font-bold text-cyan-300 mr-2">TB</div>
                <div className="text-lg text-slate-300">Tech Buddy Space</div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Admin Login
              </h1>
              <p className="text-slate-400">
                Access the applications dashboard
              </p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl mb-6">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-900/70 border border-white/15 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-300/60 transition-colors"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-900/70 border border-white/15 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-cyan-300/60 transition-colors"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || !loginForm.username || !loginForm.password}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:from-cyan-700 disabled:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center"
              >
                {loggingIn ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Applications loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-[60%] bg-indigo-500/10 blur-[140px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950/75 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden relative z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500/90 to-indigo-500/90 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Internship Applications</h1>
              <p className="text-cyan-100 text-sm">Total Applications: {applications.length}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-xl transition duration-200 flex items-center border border-white/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Applications List */}
          <div className="p-6">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                <p className="text-slate-400">Applications will appear here once submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-slate-900/80">
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">College</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 bg-slate-950/50">
                    {applications.map((app) => (
                      <tr key={app.applicationId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-white">{app.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-300">{app.email}</td>
                        <td className="px-4 py-4 text-sm text-slate-300">{app.position || 'Not specified'}</td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {app.isStudent ? app.college : 'Not a student'}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">{app.department}</td>
                        <td className="px-4 py-4 text-sm text-slate-300">{formatDate(app.submittedAt)}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            app.status === 'approved' ? 'bg-green-500/15 text-green-300 border-green-400/30' :
                            app.status === 'rejected' ? 'bg-red-500/15 text-red-300 border-red-400/30' :
                            'bg-yellow-500/15 text-yellow-300 border-yellow-400/30'
                          }`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm space-x-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            View Details
                          </button>
                          {app.resumeFileName && (
                            <button
                              onClick={() => downloadResume(app.applicationId, app.resumeOriginalName)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              Resume
                            </button>
                          )}
                          {!app.status || app.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleStatusAction(app, 'approved')}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusAction(app, 'rejected')}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : app.status === 'rejected' ? (
                            <>
                              <button
                                onClick={() => handleStatusAction(app, 'approved')}
                                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => deleteApplication(app.applicationId, app.name)}
                                disabled={deletingApplication === app.applicationId}
                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                {deletingApplication === app.applicationId ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : app.status === 'approved' ? (
                            <>
                              <button
                                onClick={() => giveInternAccess(app.applicationId, app.name)}
                                disabled={givingAccess === app.applicationId || app.accessGiven}
                                className={`${
                                  app.accessGiven 
                                    ? 'bg-slate-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800'
                                } text-white px-3 py-1.5 rounded-lg text-xs transition-colors`}
                                title={app.accessGiven ? 'Access already given' : 'Create intern account and send login credentials'}
                              >
                                {givingAccess === app.applicationId ? 'Processing...' : app.accessGiven ? 'Access Given' : 'Give Access'}
                              </button>
                              <button
                                onClick={() => handleSendDocument(app)}
                                className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Send Doc
                              </button>
                              <button
                                onClick={() => deleteApplication(app.applicationId, app.name)}
                                disabled={deletingApplication === app.applicationId}
                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                {deletingApplication === app.applicationId ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => deleteApplication(app.applicationId, app.name)}
                              disabled={deletingApplication === app.applicationId}
                              className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              {deletingApplication === app.applicationId ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Application Details Modal */}
        {selectedApplication && !showStatusModal && !showTemplateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-white hover:text-slate-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Name</label>
                      <p className="text-slate-100">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Email</label>
                      <p className="text-slate-100">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Phone</label>
                      <p className="text-slate-100">{selectedApplication.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Applied Position</label>
                      <p className="text-slate-100 font-medium">{selectedApplication.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Availability</label>
                      <p className="text-slate-100">{selectedApplication.availability || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {selectedApplication.isStudent && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-400">College</label>
                        <p className="text-slate-100">{selectedApplication.college}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Department</label>
                        <p className="text-slate-100">{selectedApplication.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-400">Year</label>
                        <p className="text-slate-100">{selectedApplication.year}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Links */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Professional Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">GitHub</label>
                      <p className="text-slate-100">
                        {selectedApplication.github ? (
                          <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                            {selectedApplication.github}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">LinkedIn</label>
                      <p className="text-slate-100">
                        {selectedApplication.linkedin ? (
                          <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                            {selectedApplication.linkedin}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Portfolio</label>
                      <p className="text-slate-100">
                        {selectedApplication.portfolio ? (
                          <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                            {selectedApplication.portfolio}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Skills</label>
                      <p className="text-slate-100">{selectedApplication.skills || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Experience</label>
                      <p className="text-slate-100">{selectedApplication.experience || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Motivation</label>
                      <p className="text-slate-100">{selectedApplication.motivation || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Application Metadata */}
                <div className="bg-slate-900/80 border border-white/10 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-white mb-3">Application Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-400">Application ID</label>
                      <p className="text-slate-100 font-mono text-sm">{selectedApplication.applicationId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-400">Submitted At</label>
                      <p className="text-slate-100">{formatDate(selectedApplication.submittedAt)}</p>
                    </div>
                    {selectedApplication.accessGiven && (
                      <div className="md:col-span-2">
                        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-green-300">Intern Access Given</p>
                              <p className="text-xs text-green-200">
                                Login credentials sent on {formatDate(selectedApplication.accessGivenAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full">
              <div className={`px-6 py-4 rounded-t-2xl flex justify-between items-center ${
                statusAction === 'approved' ? 'bg-green-600/90' : 'bg-red-600/90'
              } text-white`}>
                <h2 className="text-xl font-bold">
                  {statusAction === 'approved' ? 'Approve Application' : 'Reject Application'}
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-slate-300 mb-4">
                  Are you sure you want to {statusAction} the application from <strong>{selectedApplication.name}</strong>?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {statusAction === 'approved' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
                  </label>
                  <textarea
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows="3"
                    placeholder={statusAction === 'approved' ? 
                      'Welcome message or next steps...' : 
                      'Reason for rejection or feedback...'
                    }
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateApplicationStatus(selectedApplication.applicationId, statusAction, statusMessage)}
                    disabled={statusUpdating}
                    className={`flex-1 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ${
                      statusAction === 'approved' 
                        ? 'bg-green-600 hover:bg-green-500 disabled:bg-green-800'
                        : 'bg-red-600 hover:bg-red-500 disabled:bg-red-800'
                    }`}
                  >
                    {statusUpdating ? 'Processing...' : `Confirm ${statusAction === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    disabled={statusUpdating}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateModal && selectedApplication && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Send Document to {selectedApplication.name}</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Document Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateSelection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title} ({template.type})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTemplate && manualFields.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Manual Fields Required</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      These fields were marked as &quot;Manual Entry&quot; during template setup and require your input:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {manualFields.map((fieldKey) => (
                        <div key={fieldKey}>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                          </label>
                          <input
                            type="text"
                            value={templateData[fieldKey] || ''}
                            onChange={(e) => setTemplateData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            placeholder={`Enter ${fieldKey.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTemplate && manualFields.length === 0 && (
                  <div className="mb-6">
                    <div className="bg-green-500/10 border border-green-400/30 text-green-200 px-4 py-3 rounded-lg">
                      <p className="font-medium">✅ Fully Automated</p>
                      <p className="text-sm">All template fields are mapped to application data. No manual input required!</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => generateDocument(selectedApplication, selectedTemplate)}
                    disabled={!selectedTemplate || (manualFields.length > 0 && manualFields.some(field => !templateData[field]))}
                    className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Generate & Send Document
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>

                {selectedTemplate && (
                  <div className="mt-4 bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 px-4 py-3 rounded-lg">
                    <h4 className="font-semibold mb-2">Automated Document Generation:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Applicant data (name, email, college, etc.) will be automatically populated</li>
                      <li>System data (current date, company name) will be added automatically</li>
                      {manualFields.length > 0 ? (
                        <li>Only the fields above require manual input as configured in template mapping</li>
                      ) : (
                        <li>No manual input required - document will be generated automatically!</li>
                      )}
                      <li>Document will be generated and emailed to the applicant immediately</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

