'use client';

import { useState, useEffect } from 'react';

export default function MigratePage() {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMigrationStatus();
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

  const fetchMigrationStatus = async () => {
    try {
      const response = await fetch('/api/migrate-to-r2');
      if (response.ok) {
        const data = await response.json();
        setMigrationStatus(data.status);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch migration status');
      }
    } catch (error) {
      console.error('Error fetching migration status:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startMigration = async () => {
    if (!confirm('Are you sure you want to migrate all local applications to MongoDB database? This process cannot be undone.')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);
    setError('');

    try {
      const response = await fetch('/api/migrate-to-r2', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setMigrationResult(data);
        // Refresh status after migration
        await fetchMigrationStatus();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Migration failed');
      }
    } catch (error) {
      console.error('Error during migration:', error);
      setError('Network error occurred during migration');
    } finally {
      setMigrating(false);
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
          <p className="text-gray-600">Loading migration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <h1 className="text-2xl font-bold">Migrate to MongoDB</h1>
            <p className="text-blue-100">Move applications from local storage to MongoDB database</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> {error}
              </div>
            )}

            {migrationResult && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                <h3 className="font-semibold mb-2">Migration Completed!</h3>
                <p>{migrationResult.message}</p>
                {migrationResult.results && (
                  <div className="mt-3 text-sm">
                    <p>Total files: {migrationResult.results.total}</p>
                    <p>Successfully migrated: {migrationResult.results.migrated}</p>
                    <p>Skipped: {migrationResult.results.skipped.length}</p>
                    <p>Errors: {migrationResult.results.errors.length}</p>
                  </div>
                )}
              </div>
            )}

            {migrationStatus && (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">MongoDB:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        migrationStatus.mongodbAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {migrationStatus.mongodbAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">Local Directory:</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        migrationStatus.localDirectoryExists 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {migrationStatus.localDirectoryExists ? 'Exists' : 'Not Found'}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">Local Applications:</span>
                      <span className="text-gray-900">{migrationStatus.localApplicationCount}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-40">MongoDB Applications:</span>
                      <span className="text-gray-900">{migrationStatus.mongodbApplicationCount}</span>
                    </div>
                  </div>
                </div>

                {/* Migration Actions */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-900 mb-3">Migration</h2>
                  
                  {!migrationStatus.mongodbAvailable ? (
                    <div className="text-red-800">
                      <p className="mb-2">❌ MongoDB is not available. Please check your configuration:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Verify MONGODB_URI environment variable</li>
                        <li>Ensure MongoDB server is running</li>
                        <li>Check network connectivity to MongoDB</li>
                        <li>Verify database permissions</li>
                      </ul>
                    </div>
                  ) : migrationStatus.localApplicationCount === 0 ? (
                    <div className="text-green-800">
                      <p>✅ No local applications found. Migration not needed.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-blue-800">
                        <p className="mb-2">Ready to migrate {migrationStatus.localApplicationCount} applications to MongoDB database.</p>
                        <p className="text-sm">This will:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                          <li>Upload all application data to MongoDB</li>
                          <li>Preserve resume file URLs (already stored in R2)</li>
                          <li>Skip applications that already exist in MongoDB</li>
                          <li>Preserve all existing data</li>
                        </ul>
                      </div>
                      
                      <button
                        onClick={startMigration}
                        disabled={migrating}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center"
                      >
                        {migrating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Migrating...
                          </>
                        ) : (
                          'Start Migration'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Important Notes</h3>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                    <li>This migration is safe and will not delete your local files</li>
                    <li>Applications already in MongoDB will be skipped</li>
                    <li>After successful migration, the system will use MongoDB for all operations</li>
                    <li>You can safely delete local files after confirming migration success</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-4">
              <button
                onClick={fetchMigrationStatus}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Refresh Status
              </button>
              <a
                href="/admin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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