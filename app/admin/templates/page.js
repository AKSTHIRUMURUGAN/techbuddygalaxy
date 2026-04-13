'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FiArrowLeft,
  FiEdit2,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiLink2,
  FiLoader,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX
} from 'react-icons/fi';

export default function TemplatesAdminPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    type: '',
    url: '',
    description: ''
  });
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [placeholders, setPlaceholders] = useState([]);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [format, setFormat] = useState('docx');
  const [applicationSchema, setApplicationSchema] = useState([]);
  const [fieldMappings, setFieldMappings] = useState({});
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [mappingTemplate, setMappingTemplate] = useState(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
      fetchApplicationSchema();
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/get-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationSchema = async () => {
    try {
      const response = await fetch('/api/get-application-schema');
      if (response.ok) {
        const data = await response.json();
        setApplicationSchema(data.schema || []);
      }
    } catch (error) {
      console.error('Error fetching application schema:', error);
    }
  };

  const addTemplate = async () => {
    if (!newTemplate.title || !newTemplate.type || !newTemplate.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/get-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      });

      if (response.ok) {
        await fetchTemplates();
        setShowAddModal(false);
        setNewTemplate({ title: '', type: '', url: '', description: '' });
        toast.success('Template added successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding template:', error);
      toast.error('Network error occurred');
    } finally {
      setAdding(false);
    }
  };

  const editTemplate = (template) => {
    if (!template.id.startsWith('custom-')) {
      toast.error('Cannot edit default templates');
      return;
    }
    
    setEditingTemplate(template);
    setNewTemplate({
      title: template.title,
      type: template.type,
      url: template.url,
      description: template.description || ''
    });
    setShowEditModal(true);
  };

  const updateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.type || !newTemplate.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/get-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...newTemplate
        }),
      });

      if (response.ok) {
        await fetchTemplates();
        setShowEditModal(false);
        setEditingTemplate(null);
        setNewTemplate({ title: '', type: '', url: '', description: '' });
        toast.success('Template updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Network error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const deleteTemplate = async (template) => {
    if (!template.id.startsWith('custom-')) {
      toast.error('Cannot delete default templates');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${template.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(template.id);
    try {
      const response = await fetch(`/api/get-templates?id=${template.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTemplates();
        toast.success('Template deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Network error occurred');
    } finally {
      setDeleting(null);
    }
  };

  const previewTemplate = async (template) => {
    setPreviewingTemplate(template);
    setAnalyzing(true);
    setPlaceholders([]);
    setFormData({});
    setShowPreviewModal(true);

    try {
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateUrl: template.url }),
      });

      if (response.ok) {
        const result = await response.json();
        setPlaceholders(result.placeholders);
        
        // Initialize form data with sample values
        const initialFormData = {};
        result.placeholders.forEach(placeholder => {
          // Provide sample data based on placeholder name
          const key = placeholder.key.toLowerCase();
          if (key.includes('name')) {
            initialFormData[placeholder.key] = 'John Doe';
          } else if (key.includes('email')) {
            initialFormData[placeholder.key] = 'john.doe@example.com';
          } else if (key.includes('phone')) {
            initialFormData[placeholder.key] = '+1234567890';
          } else if (key.includes('position')) {
            initialFormData[placeholder.key] = 'Software Developer';
          } else if (key.includes('date')) {
            initialFormData[placeholder.key] = new Date().toISOString().split('T')[0];
          } else if (key.includes('company')) {
            initialFormData[placeholder.key] = 'TechBuddy Space';
          } else if (key.includes('salary') || key.includes('amount')) {
            initialFormData[placeholder.key] = '50000';
          } else {
            initialFormData[placeholder.key] = `Sample ${placeholder.key}`;
          }
        });
        setFormData(initialFormData);
      } else {
        const errorData = await response.json();
        toast.error(`Error analyzing template: ${errorData.error}`);
        setShowPreviewModal(false);
      }
    } catch (error) {
      console.error('Error analyzing template:', error);
      toast.error('Network error occurred');
      setShowPreviewModal(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateTestDocument = async () => {
    setGenerating(true);
    try {
      const endpoint = format === 'pdf' ? '/api/generate-from-url-pdf' : '/api/generate-from-url';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateUrl: previewingTemplate.url,
          data: formData
        }),
      });

      if (response.ok) {
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const fileExtension = format === 'pdf' ? 'pdf' : 'docx';
        a.download = `test-${previewingTemplate.title.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        toast.error(`Error generating document: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Network error occurred');
    } finally {
      setGenerating(false);
    }
  };

  const formatPlaceholderName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const setupFieldMapping = async (template) => {
    setMappingTemplate(template);
    setAnalyzing(true);
    setPlaceholders([]);
    setFieldMappings({});
    setShowMappingModal(true);

    try {
      // First, check if we have existing mapping for this template
      const mappingResponse = await fetch(`/api/save-template-mapping?templateId=${template.id}`);
      if (mappingResponse.ok) {
        const mappingData = await mappingResponse.json();
        if (mappingData.mapping) {
          setFieldMappings(mappingData.mapping.fieldMappings);
        }
      }

      // Analyze template for placeholders
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateUrl: template.url }),
      });

      if (response.ok) {
        const result = await response.json();
        setPlaceholders(result.placeholders);
        
        // Auto-map fields that match schema keys
        const autoMappings = {};
        result.placeholders.forEach(placeholder => {
          const schemaField = applicationSchema.find(field => 
            field.key.toLowerCase() === placeholder.key.toLowerCase() ||
            field.label.toLowerCase().includes(placeholder.key.toLowerCase()) ||
            placeholder.key.toLowerCase().includes(field.key.toLowerCase())
          );
          
          if (schemaField) {
            autoMappings[placeholder.key] = schemaField.key;
          }
        });
        
        setFieldMappings(prev => ({ ...prev, ...autoMappings }));
      } else {
        const errorData = await response.json();
        toast.error(`Error analyzing template: ${errorData.error}`);
        setShowMappingModal(false);
      }
    } catch (error) {
      console.error('Error setting up field mapping:', error);
      toast.error('Network error occurred');
      setShowMappingModal(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const saveFieldMapping = async () => {
    try {
      const response = await fetch('/api/save-template-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: mappingTemplate.id,
          templateUrl: mappingTemplate.url,
          fieldMappings
        }),
      });

      if (response.ok) {
        toast.success('Field mapping saved successfully!');
        setShowMappingModal(false);
        setMappingTemplate(null);
        setPlaceholders([]);
        setFieldMappings({});
      } else {
        const errorData = await response.json();
        toast.error(`Error saving mapping: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving field mapping:', error);
      toast.error('Network error occurred');
    }
  };

  const handleMappingChange = (placeholderKey, schemaKey) => {
    setFieldMappings(prev => ({
      ...prev,
      [placeholderKey]: schemaKey
    }));
  };

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Document Templates</h1>
              <p className="text-violet-100">Manage templates for generating documents</p>
              <p className="text-violet-200 text-sm mt-1">
                <span className="inline-block w-2 h-2 bg-blue-300 rounded-full mr-1"></span>
                Default templates cannot be edited or deleted
                <span className="mx-2">•</span>
                <span className="inline-block w-2 h-2 bg-purple-300 rounded-full mr-1"></span>
                Custom templates can be edited and deleted
                <span className="mx-2">•</span>
                <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-1"></span>
                Click &quot;Preview &amp; Test&quot; to analyze placeholders and test generation
                <span className="mx-2">•</span>
                <span className="inline-block w-2 h-2 bg-orange-300 rounded-full mr-1"></span>
                Click &quot;Map Fields&quot; to automate data population from applications
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition duration-200 flex items-center border border-white/20"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Template
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

          {/* Templates Grid */}
          <div className="p-6">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FiFileText className="text-6xl mb-4 mx-auto text-slate-500" />
                <h3 className="text-xl font-semibold text-white mb-2">No Templates Available</h3>
                <p className="text-slate-400">Add your first template to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className={`bg-slate-900/60 border rounded-xl p-6 hover:shadow-lg transition-all ${
                    template.id.startsWith('custom-') 
                      ? 'border-violet-400/40 hover:border-violet-300/60' 
                      : 'border-white/10 hover:border-white/20'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{template.title}</h3>
                          {template.id.startsWith('custom-') && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                              Custom
                            </span>
                          )}
                          {!template.id.startsWith('custom-') && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          template.type === 'appointment' ? 'bg-blue-100 text-blue-800' :
                          template.type === 'loi' ? 'bg-green-100 text-green-800' :
                          template.type === 'certificate' ? 'bg-yellow-100 text-yellow-800' :
                          template.type === 'experience' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {template.type}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                      {template.description || 'No description provided'}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-slate-400">
                        <strong>URL:</strong> 
                        <span className="ml-1 font-mono break-all">
                          {template.url.length > 50 ? `${template.url.substring(0, 50)}...` : template.url}
                        </span>
                      </div>
                      
                      {template.createdAt && (
                        <div className="text-xs text-slate-400">
                          <strong>Added:</strong> {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewTemplate(template)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          <FiEye className="w-4 h-4 mr-2" />
                          Preview & Test
                        </button>
                        
                        <button
                          onClick={() => setupFieldMapping(template)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          <FiLink2 className="w-4 h-4 mr-2" />
                          Map Fields
                        </button>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => window.open(template.url, '_blank')}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition duration-200"
                          title="View Template"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </button>
                        
                        {template.id.startsWith('custom-') && (
                          <>
                            <button
                              onClick={() => editTemplate(template)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition duration-200"
                              title="Edit Template"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteTemplate(template)}
                              disabled={deleting === template.id}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-3 rounded-lg transition duration-200"
                              title="Delete Template"
                            >
                              {deleting === template.id ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Template Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="bg-purple-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Add New Template</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Internship Appointment Letter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select type...</option>
                    <option value="appointment">Appointment Letter</option>
                    <option value="loi">Letter of Intent</option>
                    <option value="certificate">Certificate</option>
                    <option value="experience">Experience Letter</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template URL *
                  </label>
                  <input
                    type="url"
                    value={newTemplate.url}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://docs.google.com/document/d/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Google Docs export URL or direct document link
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Brief description of this template..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={addTemplate}
                    disabled={adding || !newTemplate.title || !newTemplate.type || !newTemplate.url}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {adding ? 'Adding...' : 'Add Template'}
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

        {/* Edit Template Modal */}
        {showEditModal && editingTemplate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-xl font-bold">Edit Template</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTemplate(null);
                    setNewTemplate({ title: '', type: '', url: '', description: '' });
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Internship Appointment Letter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type...</option>
                    <option value="appointment">Appointment Letter</option>
                    <option value="loi">Letter of Intent</option>
                    <option value="certificate">Certificate</option>
                    <option value="experience">Experience Letter</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template URL *
                  </label>
                  <input
                    type="url"
                    value={newTemplate.url}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://docs.google.com/document/d/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Google Docs export URL or direct document link
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Brief description of this template..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={updateTemplate}
                    disabled={updating || !newTemplate.title || !newTemplate.type || !newTemplate.url}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {updating ? 'Updating...' : 'Update Template'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTemplate(null);
                      setNewTemplate({ title: '', type: '', url: '', description: '' });
                    }}
                    disabled={updating}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview & Test Modal */}
        {showPreviewModal && previewingTemplate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-green-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Preview & Test Template</h2>
                  <p className="text-green-100 text-sm">{previewingTemplate.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewingTemplate(null);
                    setPlaceholders([]);
                    setFormData({});
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6">
                {analyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing template for placeholders...</p>
                  </div>
                ) : placeholders.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                      <p className="font-medium">Template Analysis Complete!</p>
                      <p className="text-sm">Found {placeholders.length} placeholders. Sample data has been pre-filled for testing.</p>
                    </div>

                    {/* Dynamic Form Fields */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Template Fields ({placeholders.length} found)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {placeholders.map((placeholder) => (
                          <div key={placeholder.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {formatPlaceholderName(placeholder.key)} *
                            </label>
                            <input
                              type={placeholder.type || 'text'}
                              value={formData[placeholder.key] || ''}
                              onChange={(e) => handleInputChange(placeholder.key, e.target.value)}
                              placeholder={`Enter ${formatPlaceholderName(placeholder.key).toLowerCase()}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Format Selection */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Test Download Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="docx"
                              checked={format === 'docx'}
                              onChange={(e) => setFormat(e.target.value)}
                              className="mr-3 text-green-600"
                            />
                            <div>
                              <div className="font-medium text-gray-900">Word Document</div>
                              <div className="text-sm text-gray-500">.docx file</div>
                            </div>
                          </label>
                          <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="format"
                              value="pdf"
                              checked={format === 'pdf'}
                              onChange={(e) => setFormat(e.target.value)}
                              className="mr-3 text-green-600"
                            />
                            <div>
                              <div className="font-medium text-gray-900">PDF Document</div>
                              <div className="text-sm text-gray-500">.pdf file</div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={generateTestDocument}
                          disabled={generating || Object.values(formData).some(value => !value.trim())}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                          {generating ? (
                            <>
                              <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                              Generating Test Document...
                            </>
                          ) : (
                            <>
                              <FiSave className="w-5 h-5 mr-2" />
                              Generate Test {format === 'pdf' ? 'PDF' : 'Word'} Document
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowPreviewModal(false);
                            setPreviewingTemplate(null);
                            setPlaceholders([]);
                            setFormData({});
                          }}
                          disabled={generating}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-200"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                      <h4 className="font-semibold mb-2">Template Testing:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Sample data has been pre-filled based on placeholder names</li>
                        <li>Modify the values to test different scenarios</li>
                        <li>Generate a test document to verify the template works correctly</li>
                        <li>This helps ensure the template will work properly when used with real application data</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Placeholders Found</h3>
                    <p className="text-gray-500">This template doesn&apos;t contain any placeholders in {`{placeholder}`} format.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Field Mapping Modal */}
        {showMappingModal && mappingTemplate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-orange-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Map Template Fields</h2>
                  <p className="text-orange-100 text-sm">{mappingTemplate.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMappingModal(false);
                    setMappingTemplate(null);
                    setPlaceholders([]);
                    setFieldMappings({});
                  }}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  <FiX />
                </button>
              </div>
              
              <div className="p-6">
                {analyzing ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing template for placeholders...</p>
                  </div>
                ) : placeholders.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded">
                      <p className="font-medium">Field Mapping Setup</p>
                      <p className="text-sm">Map each template placeholder to application data fields. This enables automatic data population when generating documents.</p>
                    </div>

                    {/* Field Mapping Table */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Map Template Fields ({placeholders.length} found)
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Template Placeholder</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Map to Application Field</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Field Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {placeholders.map((placeholder) => (
                              <tr key={placeholder.key} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                      {`{${placeholder.key}}`}
                                    </code>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <select
                                    value={fieldMappings[placeholder.key] || ''}
                                    onChange={(e) => handleMappingChange(placeholder.key, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  >
                                    <option value="">Select field...</option>
                                    {applicationSchema.map((field) => (
                                      <option key={field.key} value={field.key}>
                                        {field.label}
                                      </option>
                                    ))}
                                    <option value="custom">Other (Manual Entry)</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {fieldMappings[placeholder.key] && fieldMappings[placeholder.key] !== 'custom' ? (
                                    applicationSchema.find(f => f.key === fieldMappings[placeholder.key])?.description || ''
                                  ) : fieldMappings[placeholder.key] === 'custom' ? (
                                    'Will require manual entry when generating documents'
                                  ) : (
                                    'No mapping selected'
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={saveFieldMapping}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                      >
                        <FiSave className="w-5 h-5 mr-2" />
                        Save Field Mapping
                      </button>
                      <button
                        onClick={() => {
                          setShowMappingModal(false);
                          setMappingTemplate(null);
                          setPlaceholders([]);
                          setFieldMappings({});
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition duration-200"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
                      <h4 className="font-semibold mb-2">Field Mapping Instructions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Map each template placeholder to the corresponding application data field</li>
                        <li>Auto-mapping has been attempted based on field name similarity</li>
                        <li>Select &quot;Other (Manual Entry)&quot; for fields that don&apos;t match application data</li>
                        <li>Once saved, documents will be generated automatically using mapped data</li>
                        <li>You can update mappings anytime by clicking &quot;Map Fields&quot; again</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Placeholders Found</h3>
                    <p className="text-gray-500">This template doesn&apos;t contain any placeholders in {`{placeholder}`} format.</p>
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