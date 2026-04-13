'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiAward, FiBarChart2, FiTarget } from 'react-icons/fi';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [filters, setFilters] = useState({
    position: 'all',
    period: 'all',
    limit: 10,
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [filters]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/get-positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.positions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.position !== 'all') params.append('position', filters.position);
      if (filters.period !== 'all') params.append('period', filters.period);
      params.append('limit', filters.limit);

      const response = await fetch(`/api/leaderboard?${params}`);
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-300';
    if (score >= 75) return 'text-cyan-300';
    if (score >= 60) return 'text-yellow-300';
    return 'text-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold inline-flex items-center gap-2"><FiAward /> Leaderboard</h1>
              <p className="text-violet-100">Top performing interns</p>
            </div>
            <Link href="/admin">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            <div className="mb-6 flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={filters.position}
                  onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">All Positions</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.title}>{pos.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Period
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                  className="px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">All Time</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Show Top
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                  className="px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <FiAward className="text-6xl mb-4 mx-auto text-slate-500" />
                <p className="text-xl text-slate-300 mb-2">No performance data yet</p>
                <p className="text-slate-400">Complete tasks and calculate performance to see rankings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`border rounded-xl p-4 transition hover:shadow-md ${
                      entry.rank <= 3 ? 'border-yellow-400/30 bg-yellow-500/10' : 'border-white/10 bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-3xl font-bold w-16 text-center">
                          {getRankBadge(entry.rank)}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {entry.name}
                          </h3>
                          <p className="text-sm text-slate-300">
                            {entry.department} • {entry.tasksCompleted} tasks completed
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(entry.performanceScore)}`}>
                          {entry.performanceScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Rank Score: {entry.rankScore}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-slate-400 inline-flex items-center gap-1 justify-center"><FiBarChart2 /> Performance</div>
                        <div className="font-semibold text-slate-100">{entry.performanceScore.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 inline-flex items-center gap-1 justify-center"><FiTarget /> Tasks</div>
                        <div className="font-semibold text-slate-100">{entry.tasksCompleted}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 inline-flex items-center gap-1 justify-center"><FiAward /> Rank Score</div>
                        <div className="font-semibold text-slate-100">{entry.rankScore}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
