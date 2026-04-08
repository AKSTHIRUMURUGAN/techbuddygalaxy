'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InternsManagement() {
  const [interns, setInterns] = useState([]);
  const [performances, setPerformances] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    teamLeads: 0,
  });

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    try {
      // Fetch all users with role 'intern' or 'team_lead'
      const response = await fetch('/api/users');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allUsers = data.users || [];
          
          // Filter interns and team leads
          const internUsers = allUsers.filter(u => u.role === 'intern' || u.role === 'team_lead');
          setInterns(internUsers);
          
          // Calculate stats
          const activeInterns = internUsers.filter(u => u.status === 'active' && u.role === 'intern').length;
          const teamLeads = internUsers.filter(u => u.role === 'team_lead').length;
          
          setStats({
            total: internUsers.length,
            active: activeInterns,
            teamLeads: teamLeads,
          });
          
          // Fetch performance data for each intern
          await fetchPerformances(internUsers);
        }
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformances = async (users) => {
    try {
      const perfData = {};
      for (const user of users) {
        const response = await fetch(`/api/performance?userId=${user._id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.performance) {
            perfData[user._id] = data.performance;
          }
        }
      }
      setPerformances(perfData);
    } catch (error) {
      console.error('Error fetching performances:', error);
    }
  };

  const calculatePerformance = async (userId) => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Performance calculated successfully!');
        fetchInterns();
      }
    } catch (error) {
      console.error('Error calculating performance:', error);
      toast.error('Failed to calculate performance');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Interns Management</h1>
              <p className="text-blue-100">View and manage intern performance</p>
            </div>
            <Link href="/admin">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {interns.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>No interns found.</strong> Use the &quot;Give Access&quot; button on approved applications to create intern accounts.
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="text-3xl font-bold mb-2">{stats.total}</div>
                <div className="text-blue-100">Total Interns</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="text-3xl font-bold mb-2">{stats.active}</div>
                <div className="text-green-100">Active Interns</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="text-3xl font-bold mb-2">{stats.teamLeads}</div>
                <div className="text-purple-100">Team Leads</div>
              </div>
            </div>

            {interns.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Interns List</h2>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Join Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Performance</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {interns.map((intern) => {
                        const perf = performances[intern._id];
                        return (
                          <tr key={intern._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{intern.name}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{intern.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{intern.department || 'General'}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                intern.role === 'team_lead' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {intern.role === 'team_lead' ? 'Team Lead' : 'Intern'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                intern.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {intern.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{formatDate(intern.joinDate)}</td>
                            <td className="px-4 py-4 text-sm">
                              {perf ? (
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${Math.min(perf.performanceScore || 0, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium">{Math.round(perf.performanceScore || 0)}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">No data</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm space-x-2">
                              <button
                                onClick={() => calculatePerformance(intern._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                              >
                                Calculate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/tasks">
                  <div className="border-2 border-blue-200 rounded-lg p-4 hover:bg-blue-50 transition cursor-pointer">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="font-semibold">Manage Tasks</h3>
                    <p className="text-sm text-gray-600">Create and assign tasks to interns</p>
                  </div>
                </Link>

                <Link href="/admin/leaderboard">
                  <div className="border-2 border-purple-200 rounded-lg p-4 hover:bg-purple-50 transition cursor-pointer">
                    <div className="text-2xl mb-2">🏆</div>
                    <h3 className="font-semibold">View Leaderboard</h3>
                    <p className="text-sm text-gray-600">Check intern rankings and performance</p>
                  </div>
                </Link>

                <Link href="/admin/attendance">
                  <div className="border-2 border-green-200 rounded-lg p-4 hover:bg-green-50 transition cursor-pointer">
                    <div className="text-2xl mb-2">📅</div>
                    <h3 className="font-semibold">Attendance Records</h3>
                    <p className="text-sm text-gray-600">View and manage attendance</p>
                  </div>
                </Link>

                <Link href="/admin/leaves">
                  <div className="border-2 border-orange-200 rounded-lg p-4 hover:bg-orange-50 transition cursor-pointer">
                    <div className="text-2xl mb-2">🏖️</div>
                    <h3 className="font-semibold">Leave Requests</h3>
                    <p className="text-sm text-gray-600">Approve or reject leave applications</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

