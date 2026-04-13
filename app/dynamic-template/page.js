'use client';

import { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiFileText, FiLoader, FiSearch } from 'react-icons/fi';

export default function DynamicTemplatePage() {
  const [templateUrl, setTemplateUrl] = useState('');
  const [placeholders, setPlaceholders] = useState([]);
  const [formData, setFormData] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('docx');

  const analyzeTemplate = async () => {
    if (!templateUrl.trim()) {
      setError('Please enter a template URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setPlaceholders([]);
    setFormData({});

    try {
      const response = await fetch('/api/analyze-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateUrl }),
      });

      if (response.ok) {
        const result = await response.json();
        setPlaceholders(result.placeholders);
        
        // Initialize form data with empty values
        const initialFormData = {};
        result.placeholders.forEach(placeholder => {
          initialFormData[placeholder.key] = '';
        });
        setFormData(initialFormData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to analyze template');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateDocument = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const endpoint = format === 'pdf' ? '/api/generate-from-url-pdf' : '/api/generate-from-url';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateUrl,
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
        a.download = `generated-document.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Network error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatPlaceholderName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#05070f] py-12 px-4 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl font-bold text-cyan-300 mr-2">TB</div>
              <div className="text-lg text-slate-300">Tech Buddy Space</div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dynamic Document Generator
            </h1>
            <p className="text-slate-300">
              Enter a Word document URL and we&apos;ll automatically detect placeholders
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center">
              <FiAlertCircle className="mr-2" />
              {error}
            </div>
          )}

          {/* Step 1: Template URL Input */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Step 1: Enter Template URL</h2>
            <div className="flex gap-4">
              <input
                type="url"
                value={templateUrl}
                onChange={(e) => setTemplateUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://cloudinary.com/... or any direct link"
                className="flex-1 px-4 py-3 bg-slate-900/70 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
              />
              <button
                onClick={analyzeTemplate}
                disabled={isAnalyzing || !templateUrl.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiSearch className="mr-2" /> Analyze Template
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Supported: Google Drive, Cloudinary, Cloudflare R2, or any direct download link to a .docx file (Max 10MB)
            </p>
          </div>

          {/* Step 2: Dynamic Form Fields */}
          {placeholders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Step 2: Fill in the Details ({placeholders.length} fields found)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {placeholders.map((placeholder) => (
                  <div key={placeholder.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {formatPlaceholderName(placeholder.key)} *
                    </label>
                    <input
                      type={placeholder.type || 'text'}
                      value={formData[placeholder.key] || ''}
                      onChange={(e) => handleInputChange(placeholder.key, e.target.value)}
                      placeholder={`Enter ${formatPlaceholderName(placeholder.key).toLowerCase()}`}
                      className="w-full px-4 py-3 bg-slate-900/70 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Download Format *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-white/15 rounded-lg cursor-pointer hover:bg-slate-900">
                    <input
                      type="radio"
                      name="format"
                      value="docx"
                      checked={format === 'docx'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-slate-100">Word Document</div>
                      <div className="text-sm text-slate-400">.docx file</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-white/15 rounded-lg cursor-pointer hover:bg-slate-900">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={format === 'pdf'}
                      onChange={(e) => setFormat(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-slate-100">PDF Document</div>
                      <div className="text-sm text-slate-400">.pdf file</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <button
                  onClick={generateDocument}
                  disabled={isGenerating || Object.values(formData).some(value => !value.trim())}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg transition duration-200 flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiFileText className="mr-2" />
                      {`Generate ${format === 'pdf' ? 'PDF' : 'Word'} Document`}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-cyan-500/10 border border-cyan-400/30 text-cyan-100 px-4 py-3 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center"><FiCheckCircle className="mr-2" />How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Enter a URL to your Word document template</li>
              <li>We&apos;ll download and analyze it to find placeholders like {`{name}`}, {`{position}`}, etc.</li>
              <li>Fill in the automatically generated form fields</li>
              <li>Choose your output format (Word or PDF)</li>
              <li>Download your personalized document!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}