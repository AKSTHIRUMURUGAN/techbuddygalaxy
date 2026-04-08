'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
              <p className="text-purple-100">Top performing interns</p>
            </div>
            <Link href="/admin">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Positions</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.title}>{pos.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show Top
                </label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="text-6xl mb-4">🏆</div>
                <p className="text-xl text-gray-600 mb-2">No performance data yet</p>
                <p className="text-gray-500">Complete tasks and calculate performance to see rankings</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`border rounded-lg p-4 transition hover:shadow-md ${
                      entry.rank <= 3 ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-3xl font-bold w-16 text-center">
                          {getRankBadge(entry.rank)}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {entry.department} • {entry.tasksCompleted} tasks completed
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(entry.performanceScore)}`}>
                          {entry.performanceScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rank Score: {entry.rankScore}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500">Performance</div>
                        <div className="font-semibold">{entry.performanceScore.toFixed(1)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Tasks</div>
                        <div className="font-semibold">{entry.tasksCompleted}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Rank Score</div>
                        <div className="font-semibold">{entry.rankScore}</div>
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
