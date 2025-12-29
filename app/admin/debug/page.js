'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDebugInfo();
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

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug-filesystem');
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(data.debug);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch debug info');
      }
    } catch (error) {
      console.error('Error fetching debug info:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in as admin to access this page.</p>
          <a href="/admin" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading debug information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl font-bold">System Debug Information</h1>
            <p className="text-blue-100">File system and environment diagnostics</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            {debugInfo && (
              <div className="space-y-6">
                {/* Environment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Environment</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Environment:</span>
                      <span className="ml-2 text-gray-900">{debugInfo.environment}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Platform:</span>
                      <span className="ml-2 text-gray-900">{debugInfo.platform}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Working Directory:</span>
                      <span className="ml-2 text-gray-900 font-mono text-sm">{debugInfo.cwd}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Applications Directory:</span>
                      <span className="ml-2 text-gray-900 font-mono text-sm">{debugInfo.applicationsDir}</span>
                    </div>
                  </div>
                </div>

                {/* File System Checks */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">File System Checks</h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">Directory Exists:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        debugInfo.checks.directoryExists 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {debugInfo.checks.directoryExists ? 'Yes' : 'No'}
                      </span>
                      {debugInfo.checks.directoryError && (
                        <span className="ml-2 text-red-600 text-sm">{debugInfo.checks.directoryError}</span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">Can Write Files:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        debugInfo.checks.canWrite 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {debugInfo.checks.canWrite ? 'Yes' : 'No'}
                      </span>
                      {debugInfo.checks.writeError && (
                        <span className="ml-2 text-red-600 text-sm">
                          {debugInfo.checks.writeError} ({debugInfo.checks.writeErrorCode})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">Can Create Directories:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        debugInfo.checks.canCreateDir 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {debugInfo.checks.canCreateDir ? 'Yes' : 'No'}
                      </span>
                      {debugInfo.checks.createDirError && (
                        <span className="ml-2 text-red-600 text-sm">
                          {debugInfo.checks.createDirError} ({debugInfo.checks.createDirErrorCode})
                        </span>
                      )}
                    </div>

                    {debugInfo.checks.fileCount !== undefined && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-40">Application Files:</span>
                        <span className="text-gray-900">{debugInfo.checks.fileCount} files</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Files List */}
                {debugInfo.checks.files && debugInfo.checks.files.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Files</h2>
                    <div className="space-y-1">
                      {debugInfo.checks.files.map((file, index) => (
                        <div key={index} className="font-mono text-sm text-gray-700">
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-3">Recommendations</h2>
                  <div className="space-y-2 text-blue-800">
                    {!debugInfo.checks.canWrite && (
                      <p>⚠️ File system is read-only. Consider using a database or external storage service for production.</p>
                    )}
                    {!debugInfo.checks.directoryExists && (
                      <p>⚠️ Applications directory doesn't exist. This may cause application submission failures.</p>
                    )}
                    {debugInfo.checks.canWrite && debugInfo.checks.directoryExists && (
                      <p>✅ File system appears to be working correctly.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-4">
              <button
                onClick={fetchDebugInfo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Refresh Debug Info
              </button>
              <a
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Back to Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}