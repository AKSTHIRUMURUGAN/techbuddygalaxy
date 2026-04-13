'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FiActivity, FiArrowLeft, FiAward, FiBarChart2, FiCalendar, FiClipboard, FiUser, FiUsers } from 'react-icons/fi';

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
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading interns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Interns Management</h1>
              <p className="text-cyan-100">View and manage intern performance</p>
            </div>
            <Link href="/admin">
              <button className="bg-white/20 hover:bg-white/30 border border-white/20 text-white px-4 py-2 rounded-xl transition inline-flex items-center">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {interns.length === 0 ? (
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 mb-6">
                <p className="text-cyan-100">
                  <strong>No interns found.</strong> Use the &quot;Give Access&quot; button on approved applications to create intern accounts.
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-xl border border-cyan-300/20">
                <FiUsers className="text-2xl mb-3 text-cyan-100" />
                <div className="text-3xl font-bold mb-2">{stats.total}</div>
                <div className="text-cyan-100">Total Interns</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl border border-emerald-300/20">
                <FiActivity className="text-2xl mb-3 text-emerald-100" />
                <div className="text-3xl font-bold mb-2">{stats.active}</div>
                <div className="text-emerald-100">Active Interns</div>
              </div>

              <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-6 rounded-xl border border-violet-300/20">
                <FiAward className="text-2xl mb-3 text-violet-100" />
                <div className="text-3xl font-bold mb-2">{stats.teamLeads}</div>
                <div className="text-violet-100">Team Leads</div>
              </div>
            </div>

            {interns.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Interns List</h2>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-slate-900/80">
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Join Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Performance</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/50">
                      {interns.map((intern) => {
                        const perf = performances[intern._id];
                        return (
                          <tr key={intern._id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-white">{intern.name}</td>
                            <td className="px-4 py-4 text-sm text-slate-300">{intern.email}</td>
                            <td className="px-4 py-4 text-sm text-slate-300">{intern.department || 'General'}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                intern.role === 'team_lead' ? 'bg-violet-500/15 text-violet-300 border-violet-400/30' : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                              }`}>
                                {intern.role === 'team_lead' ? 'Team Lead' : 'Intern'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                intern.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' : 'bg-slate-500/15 text-slate-300 border-slate-400/30'
                              }`}>
                                {intern.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-300">{formatDate(intern.joinDate)}</td>
                            <td className="px-4 py-4 text-sm">
                              {perf ? (
                                <div className="flex items-center">
                                  <div className="w-16 bg-slate-800 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-cyan-500 h-2 rounded-full" 
                                      style={{ width: `${Math.min(perf.performanceScore || 0, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium text-slate-200">{Math.round(perf.performanceScore || 0)}%</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">No data</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm space-x-2">
                              <button
                                onClick={() => calculatePerformance(intern._id)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs inline-flex items-center"
                              >
                                <FiBarChart2 className="mr-1" />
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
              <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/tasks">
                  <div className="border border-cyan-400/30 bg-slate-900/60 rounded-xl p-4 hover:bg-slate-900 transition cursor-pointer">
                    <FiClipboard className="text-2xl mb-2 text-cyan-300" />
                    <h3 className="font-semibold text-white">Manage Tasks</h3>
                    <p className="text-sm text-slate-300">Create and assign tasks to interns</p>
                  </div>
                </Link>

                <Link href="/admin/leaderboard">
                  <div className="border border-violet-400/30 bg-slate-900/60 rounded-xl p-4 hover:bg-slate-900 transition cursor-pointer">
                    <FiAward className="text-2xl mb-2 text-violet-300" />
                    <h3 className="font-semibold text-white">View Leaderboard</h3>
                    <p className="text-sm text-slate-300">Check intern rankings and performance</p>
                  </div>
                </Link>

                <Link href="/admin/attendance">
                  <div className="border border-emerald-400/30 bg-slate-900/60 rounded-xl p-4 hover:bg-slate-900 transition cursor-pointer">
                    <FiCalendar className="text-2xl mb-2 text-emerald-300" />
                    <h3 className="font-semibold text-white">Attendance Records</h3>
                    <p className="text-sm text-slate-300">View and manage attendance</p>
                  </div>
                </Link>

                <Link href="/admin/leaves">
                  <div className="border border-amber-400/30 bg-slate-900/60 rounded-xl p-4 hover:bg-slate-900 transition cursor-pointer">
                    <FiUser className="text-2xl mb-2 text-amber-300" />
                    <h3 className="font-semibold text-white">Leave Requests</h3>
                    <p className="text-sm text-slate-300">Approve or reject leave applications</p>
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

