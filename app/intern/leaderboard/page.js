'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiAward, FiInfo, FiTarget, FiTrendingUp } from 'react-icons/fi';

export default function InternLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);
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
        fetchLeaderboard(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchLeaderboard = async (userId) => {
    try {
      const response = await fetch('/api/leaderboard?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
        
        // Find user's rank
        const userEntry = data.leaderboard.find(entry => entry.userId === userId);
        if (userEntry) {
          setMyRank(userEntry.rank);
        }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold inline-flex items-center gap-2"><FiAward /> Leaderboard</h1>
              <p className="text-yellow-100">See how you rank among your peers</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* My Rank Card */}
            {myRank && (
              <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-400/30 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Your Current Rank</p>
                    <div className="text-4xl font-bold text-violet-300">
                      {getRankBadge(myRank)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 mb-1">Keep Going!</p>
                    <p className="text-lg font-semibold text-slate-100">
                      {myRank === 1 ? "You're #1!" : `${myRank - 1} more to go!`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 text-center text-white">Top Performers</h2>
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd Place */}
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-gray-300 to-gray-400 text-white rounded-t-lg p-4 text-center">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="font-bold text-lg">{leaderboard[1].name}</div>
                      <div className="text-sm opacity-90">{leaderboard[1].department}</div>
                      <div className="text-2xl font-bold mt-2">{leaderboard[1].performanceScore.toFixed(1)}</div>
                    </div>
                    <div className="bg-gray-300 h-24 rounded-b-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">2</span>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white rounded-t-lg p-4 text-center">
                      <div className="text-5xl mb-2">🥇</div>
                      <div className="font-bold text-xl">{leaderboard[0].name}</div>
                      <div className="text-sm opacity-90">{leaderboard[0].department}</div>
                      <div className="text-3xl font-bold mt-2">{leaderboard[0].performanceScore.toFixed(1)}</div>
                    </div>
                    <div className="bg-yellow-400 h-32 rounded-b-lg flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">1</span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex-1 max-w-xs">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-t-lg p-4 text-center">
                      <div className="text-4xl mb-2">🥉</div>
                      <div className="font-bold text-lg">{leaderboard[2].name}</div>
                      <div className="text-sm opacity-90">{leaderboard[2].department}</div>
                      <div className="text-2xl font-bold mt-2">{leaderboard[2].performanceScore.toFixed(1)}</div>
                    </div>
                    <div className="bg-orange-400 h-20 rounded-b-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">3</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Leaderboard */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">All Rankings</h2>
              
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-xl mb-2">No rankings yet</p>
                  <p>Complete tasks to appear on the leaderboard</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.userId}
                      className={`border rounded-lg p-4 transition hover:shadow-md ${
                        entry.userId === user?.id
                          ? 'border-violet-400/40 bg-violet-500/10'
                          : entry.rank <= 3
                          ? 'border-yellow-400/30 bg-yellow-500/10'
                          : 'border-white/10 bg-slate-900/50'
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
                              {entry.userId === user?.id && (
                                <span className="ml-2 text-sm bg-violet-600 text-white px-2 py-1 rounded">
                                  You
                                </span>
                              )}
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
              <h3 className="font-bold text-cyan-100 mb-2 inline-flex items-center gap-2"><FiInfo />How Rankings Work</h3>
              <p className="text-sm text-cyan-100/90">
                Rankings are calculated based on your overall performance score (50%), 
                number of tasks completed (30%), and consistency (20%). 
                Keep completing tasks with high quality to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
