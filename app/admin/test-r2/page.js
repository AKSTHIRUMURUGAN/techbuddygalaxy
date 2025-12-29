'use client';

import { useState, useEffect } from 'react';

export default function TestR2Page() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runTest = async () => {
    setLoading(true);
    setError('');
    setTestResults(null);

    try {
      const response = await fetch('/api/test-r2');
      const data = await response.json();
      
      if (response.ok) {
        setTestResults(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              R2 Storage Test
            </h1>
            <p className="text-gray-600">
              Test Cloudflare R2 storage connectivity and configuration
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={runTest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                'Run Test'
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {testResults && (
            <div className="space-y-6">
              {/* R2 Availability */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">R2 Availability</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  testResults.r2Available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.r2Available ? '✅ Available' : '❌ Not Available'}
                </div>
              </div>

              {/* Environment Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults.environment).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value ? 'Set' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuration Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Details</h2>
                <div className="space-y-3">
                  {Object.entries(testResults.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-white rounded border">
                      <span className="font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className="text-gray-600 font-mono text-sm">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Test */}
              {testResults.connectionTest && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Connection Test</h2>
                  <div className={`p-4 rounded border ${
                    testResults.connectionTest.includes('SUCCESS')
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : testResults.connectionTest.includes('FAILED')
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                    <p className="font-medium">{testResults.connectionTest}</p>
                    {testResults.connectionError && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Error Details</summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                          {testResults.connectionError}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">Setup Instructions</h2>
                <div className="space-y-3 text-blue-800">
                  <p><strong>1.</strong> Go to Cloudflare Dashboard → R2 Object Storage</p>
                  <p><strong>2.</strong> Create a bucket (if not exists)</p>
                  <p><strong>3.</strong> Go to &quot;Manage R2 API tokens&quot; → Create API token</p>
                  <p><strong>4.</strong> Set permissions: Object Read & Write</p>
                  <p><strong>5.</strong> Update your .env.local file with the credentials</p>
                  <p><strong>6.</strong> Restart your development server</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}