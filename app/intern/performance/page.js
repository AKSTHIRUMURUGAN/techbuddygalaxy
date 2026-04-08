'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InternPerformance() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/intern-auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        fetchPerformance(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchPerformance = async (userId) => {
    try {
      const response = await fetch(`/api/performance?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPerformance(data.performance);
      } else if (response.status === 404) {
        // Performance not found, try to calculate it
        await handleRecalculate(userId);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (userId = user?.id) => {
    if (!userId) return;
    setCalculating(true);
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        setPerformance(data.performance);
        toast.success('Performance recalculated successfully!');
      }
    } catch (error) {
      console.error('Error calculating performance:', error);
      toast.error('Failed to calculate performance');
    } finally {
      setCalculating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-300';
    if (score >= 75) return 'bg-blue-50 border-blue-300';
    if (score >= 60) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance...</p>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">No Performance Data</h2>
            <p className="text-gray-600 mb-6">
              Your performance hasn't been calculated yet. Complete some tasks to see your performance metrics.
            </p>
            <button
              onClick={handleRecalculate}
              disabled={calculating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              {calculating ? 'Calculating...' : 'Calculate Performance'}
            </button>
            <div className="mt-6">
              <Link href="/intern/dashboard">
                <button className="text-blue-600 hover:text-blue-700">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold">Performance Dashboard</h1>
              <p className="text-purple-100">Track your progress and achievements</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Overall Score */}
            <div className={`border-2 rounded-lg p-8 mb-6 text-center ${getScoreBg(performance.performanceScore)}`}>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Overall Performance Score</h2>
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(performance.performanceScore)}`}>
                {performance.performanceScore.toFixed(1)}
              </div>
              <p className="text-gray-600">out of 100</p>
              <div className="mt-4">
                <button
                  onClick={handleRecalculate}
                  disabled={calculating}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg transition"
                >
                  {calculating ? 'Recalculating...' : 'Recalculate Performance'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Last calculated: {new Date(performance.lastCalculated).toLocaleString()}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Speed Score</span>
                    <span className="text-xs text-gray-500">25%</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(performance.speedScore)}`}>
                    {performance.speedScore.toFixed(1)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${performance.speedScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">On-time completion rate</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quality Score</span>
                    <span className="text-xs text-gray-500">40%</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(performance.qualityScore)}`}>
                    {performance.qualityScore.toFixed(1)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${performance.qualityScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">AI evaluation average</p>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Consistency</span>
                    <span className="text-xs text-gray-500">15%</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(performance.consistencyScore)}`}>
                    {performance.consistencyScore.toFixed(1)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${performance.consistencyScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Regular task completion</p>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Attendance</span>
                    <span className="text-xs text-gray-500">20%</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(performance.attendanceScore)}`}>
                    {performance.attendanceScore.toFixed(1)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${performance.attendanceScore}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Attendance rate</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{performance.tasksCompleted}</div>
                  <div className="text-sm text-gray-600 mt-1">Tasks Completed</div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{performance.tasksOnTime}</div>
                  <div className="text-sm text-gray-600 mt-1">On-Time Tasks</div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(performance.onTimeRate * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">On-Time Rate</div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {performance.avgCompletionTime.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Avg Completion Time</div>
                </div>
              </div>
            </div>

            {/* Performance Formula */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <h3 className="font-bold mb-3">How is Performance Calculated?</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Performance Score</strong> = (Speed × 25%) + (Quality × 40%) + (Consistency × 15%) + (Attendance × 20%)
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Speed:</strong> Based on completing tasks before deadline</li>
                  <li><strong>Quality:</strong> Based on AI evaluation scores of your work</li>
                  <li><strong>Consistency:</strong> Based on regular task completion (last 30 days)</li>
                  <li><strong>Attendance:</strong> Based on your attendance rate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
