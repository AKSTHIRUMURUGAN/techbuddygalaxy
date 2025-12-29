'use client';

import { useState, useEffect } from 'react';

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
        alert(`Application ${status} successfully!`);
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
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error occurred');
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
        alert('Template not found');
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

        alert(`${template.title} generated and sent successfully!`);
        setShowTemplateModal(false);
        setTemplateData({});
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Network error occurred');
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
        alert('Application deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Network error occurred');
    } finally {
      setDeletingApplication(null);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl font-bold text-blue-900 mr-2">TB</div>
                <div className="text-lg text-gray-600">Tech Buddy Space</div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Admin Login
              </h1>
              <p className="text-gray-600">
                Access the applications dashboard
              </p>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || !loginForm.username || !loginForm.password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
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

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Default credentials: admin / techbuddy2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Applications loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Internship Applications</h1>
              <p className="text-blue-100">Total Applications: {applications.length}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Applications Yet</h3>
                <p className="text-gray-500">Applications will appear here once submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Position</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">College</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Submitted</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.applicationId} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{app.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{app.email}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{app.position || 'Not specified'}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {app.isStudent ? app.college : 'Not a student'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{app.department}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{formatDate(app.submittedAt)}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm space-x-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                          >
                            View Details
                          </button>
                          {app.resumeFileName && (
                            <button
                              onClick={() => downloadResume(app.applicationId, app.resumeOriginalName)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Resume
                            </button>
                          )}
                          {!app.status || app.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleStatusAction(app, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusAction(app, 'rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Reject
                              </button>
                            </>
                          ) : app.status === 'rejected' ? (
                            <>
                              <button
                                onClick={() => handleStatusAction(app, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => deleteApplication(app.applicationId, app.name)}
                                disabled={deletingApplication === app.applicationId}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-xs"
                              >
                                {deletingApplication === app.applicationId ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : app.status === 'approved' ? (
                            <>
                              <button
                                onClick={() => handleSendDocument(app)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Send Doc
                              </button>
                              <button
                                onClick={() => deleteApplication(app.applicationId, app.name)}
                                disabled={deletingApplication === app.applicationId}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-xs"
                              >
                                {deletingApplication === app.applicationId ? 'Deleting...' : 'Delete'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => deleteApplication(app.applicationId, app.name)}
                              disabled={deletingApplication === app.applicationId}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-xs"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h2 className="text-xl font-bold">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedApplication.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Applied Position</label>
                      <p className="text-gray-900 font-medium">{selectedApplication.position || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Availability</label>
                      <p className="text-gray-900">{selectedApplication.availability || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                {selectedApplication.isStudent && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">College</label>
                        <p className="text-gray-900">{selectedApplication.college}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Department</label>
                        <p className="text-gray-900">{selectedApplication.department}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Year</label>
                        <p className="text-gray-900">{selectedApplication.year}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional Links */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">GitHub</label>
                      <p className="text-gray-900">
                        {selectedApplication.github ? (
                          <a href={selectedApplication.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedApplication.github}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                      <p className="text-gray-900">
                        {selectedApplication.linkedin ? (
                          <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedApplication.linkedin}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Portfolio</label>
                      <p className="text-gray-900">
                        {selectedApplication.portfolio ? (
                          <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedApplication.portfolio}
                          </a>
                        ) : 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Skills</label>
                      <p className="text-gray-900">{selectedApplication.skills || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900">{selectedApplication.experience || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Motivation</label>
                      <p className="text-gray-900">{selectedApplication.motivation || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Application Metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Application ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedApplication.applicationId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted At</label>
                      <p className="text-gray-900">{formatDate(selectedApplication.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className={`px-6 py-4 rounded-t-lg flex justify-between items-center ${
                statusAction === 'approved' ? 'bg-green-600' : 'bg-red-600'
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
                <p className="text-gray-700 mb-4">
                  Are you sure you want to {statusAction} the application from <strong>{selectedApplication.name}</strong>?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {statusAction === 'approved' ? 'Approval Message (Optional)' : 'Rejection Reason (Optional)'}
                  </label>
                  <textarea
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                        : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    }`}
                  >
                    {statusUpdating ? 'Processing...' : `Confirm ${statusAction === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    disabled={statusUpdating}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-200"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateSelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Manual Fields Required</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      These fields were marked as &quot;Manual Entry&quot; during template setup and require your input:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {manualFields.map((fieldKey) => (
                        <div key={fieldKey}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} *
                          </label>
                          <input
                            type="text"
                            value={templateData[fieldKey] || ''}
                            onChange={(e) => setTemplateData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                      <p className="font-medium">✅ Fully Automated</p>
                      <p className="text-sm">All template fields are mapped to application data. No manual input required!</p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => generateDocument(selectedApplication, selectedTemplate)}
                    disabled={!selectedTemplate || (manualFields.length > 0 && manualFields.some(field => !templateData[field]))}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Generate & Send Document
                  </button>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>

                {selectedTemplate && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
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