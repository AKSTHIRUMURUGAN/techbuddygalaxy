'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBell, FiCalendar, FiCheckCircle, FiClock, FiHome, FiLogOut, FiMessageCircle, FiUser } from 'react-icons/fi';

export default function InternDashboard() {
  const [stats, setStats] = useState({
    tasksTotal: 0,
    tasksCompleted: 0,
    tasksPending: 0,
    tasksInProgress: 0,
    performanceScore: 0,
    attendanceRate: 0,
    rank: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
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
        fetchDashboardData(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/intern-auth/logout', { method: 'POST' });
      localStorage.removeItem('internUser');
      router.push('/intern');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchDashboardData = async (userId) => {
    try {
      // Fetch tasks
      const tasksRes = await fetch(`/api/tasks?userId=${userId}`);
      const tasksData = await tasksRes.json();
      
      if (tasksData.success) {
        const tasks = tasksData.tasks;
        setRecentTasks(tasks.slice(0, 5));
        
        setStats(prev => ({
          ...prev,
          tasksTotal: tasks.length,
          tasksCompleted: tasks.filter(t => t.status === 'Completed').length,
          tasksPending: tasks.filter(t => t.status === 'Pending').length,
          tasksInProgress: tasks.filter(t => t.status === 'In Progress').length,
        }));
      }

      // Fetch performance - handle if not found
      try {
        const perfRes = await fetch(`/api/performance?userId=${userId}`);
        const perfData = await perfRes.json();
        
        if (perfData.success) {
          setStats(prev => ({
            ...prev,
            performanceScore: perfData.performance.performanceScore || 0,
            attendanceRate: (perfData.performance.attendanceRate || 0) * 100,
          }));
        } else if (perfRes.status === 404) {
          // Performance not found, calculate it
          await fetch('/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
        }
      } catch (perfError) {
        console.log('Performance data not available yet');
      }

      // Fetch notifications
      try {
        const notifRes = await fetch(`/api/notifications?userId=${userId}&limit=5`);
        const notifData = await notifRes.json();
        
        if (notifData.success) {
          setNotifications(notifData.notifications);
        }
      } catch (notifError) {
        console.log('Notifications not available yet');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/30',
      'In Progress': 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30',
      'Completed': 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
      'Overdue': 'bg-red-500/15 text-red-300 border border-red-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border border-slate-400/30';
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);

    // Mark as read if not already
    if (!notification.read) {
      try {
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: notification._id }),
        });

        // Update local state
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-violet-600 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back, {user?.name || 'Intern'}! 👋</h1>
              <p className="text-cyan-100 mt-1">Here&apos;s your performance overview</p>
            </div>
            <div className="flex gap-3">
              <Link href="/intern/profile">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition flex items-center border border-white/20">
                  <FiUser className="w-4 h-4 mr-2" />
                  Profile
                </button>
              </Link>
              <Link href="/">
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                  <FiHome className="mr-2" />
                  Home
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-xl transition inline-flex items-center"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">{stats.tasksTotal}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-emerald-300 mt-1">{stats.tasksCompleted}</p>
              </div>
              <FiCheckCircle className="text-4xl text-emerald-300" />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Performance</p>
                <p className="text-3xl font-bold text-cyan-300 mt-1">{stats.performanceScore.toFixed(1)}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Attendance</p>
                <p className="text-3xl font-bold text-violet-300 mt-1">{stats.attendanceRate.toFixed(0)}%</p>
              </div>
              <FiCalendar className="text-4xl text-violet-300" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/intern/tasks">
                  <div className="text-center p-4 border border-cyan-400/30 bg-slate-900/60 rounded-lg hover:bg-slate-900 transition cursor-pointer">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-sm font-medium">My Tasks</p>
                  </div>
                </Link>

                <Link href="/intern/attendance">
                  <div className="text-center p-4 border border-emerald-400/30 bg-slate-900/60 rounded-lg hover:bg-slate-900 transition cursor-pointer">
                    <div className="text-3xl mb-2">⏰</div>
                    <p className="text-sm font-medium">Attendance</p>
                  </div>
                </Link>

                <Link href="/intern/messages">
                  <div className="text-center p-4 border border-pink-400/30 bg-slate-900/60 rounded-lg hover:bg-slate-900 transition cursor-pointer">
                    <FiMessageCircle className="text-3xl mb-2 mx-auto text-pink-300" />
                    <p className="text-sm font-medium">Messages</p>
                  </div>
                </Link>

                <Link href="/intern/leaves">
                  <div className="text-center p-4 border border-amber-400/30 bg-slate-900/60 rounded-lg hover:bg-slate-900 transition cursor-pointer">
                    <div className="text-3xl mb-2">🏖️</div>
                    <p className="text-sm font-medium">Apply Leave</p>
                  </div>
                </Link>

                <Link href="/intern/leaderboard">
                  <div className="text-center p-4 border border-violet-400/30 bg-slate-900/60 rounded-lg hover:bg-slate-900 transition cursor-pointer">
                    <div className="text-3xl mb-2">🏆</div>
                    <p className="text-sm font-medium">Leaderboard</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Tasks</h2>
                <Link href="/intern/tasks">
                  <button className="text-cyan-300 hover:text-cyan-200 text-sm font-medium">
                    View All →
                  </button>
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task._id} className="border border-white/10 bg-slate-900/50 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{task.description}</p>
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span>Priority: {task.priority}</span>
                        {task.deadline && (
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Card */}
            <div className="bg-gradient-to-br from-cyan-500 to-violet-600 text-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Your Performance</h3>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{stats.performanceScore.toFixed(1)}</div>
                <p className="text-cyan-100 mb-4">Overall Score</p>
                <Link href="/intern/performance">
                  <button className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-medium hover:bg-cyan-50 transition w-full">
                    View Details
                  </button>
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold inline-flex items-center gap-2"><FiBell /> Notifications</h3>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-lg cursor-pointer transition hover:shadow-md ${notif.read ? 'bg-slate-900/70' : 'bg-cyan-500/10 border border-cyan-400/20'}`}
                    >
                      <p className="text-sm font-medium text-slate-100">{notif.title}</p>
                      <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Task Progress */}
            <div className="bg-slate-950/80 border border-white/10 rounded-xl shadow p-6">
              <h3 className="font-bold mb-4">Task Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completed</span>
                    <span className="font-medium">{stats.tasksCompleted}/{stats.tasksTotal}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.tasksTotal > 0 ? (stats.tasksCompleted / stats.tasksTotal) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>In Progress</span>
                    <span className="font-medium">{stats.tasksInProgress}/{stats.tasksTotal}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.tasksTotal > 0 ? (stats.tasksInProgress / stats.tasksTotal) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pending</span>
                    <span className="font-medium">{stats.tasksPending}/{stats.tasksTotal}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${stats.tasksTotal > 0 ? (stats.tasksPending / stats.tasksTotal) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-lg w-full">
            <div className="bg-cyan-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Notification</h2>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-white hover:text-slate-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="ml-2 font-medium text-slate-100 capitalize">{selectedNotification.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span>
                    <span className="ml-2 font-medium text-slate-100">
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedNotification.link && (
                <div className="mt-4">
                  <Link href={selectedNotification.link}>
                    <button 
                      onClick={() => setShowNotificationModal(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                    >
                      View Details
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setShowNotificationModal(false)}
                className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
