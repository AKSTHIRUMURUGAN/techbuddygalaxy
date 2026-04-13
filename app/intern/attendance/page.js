'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiPauseCircle, FiPlayCircle, FiXCircle } from 'react-icons/fi';

export default function InternAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWorkSession, setCurrentWorkSession] = useState(null);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [isCustomTask, setIsCustomTask] = useState(false);
  const [stats, setStats] = useState({
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    totalHours: 0,
  });
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
        fetchAttendance(data.user.id);
        fetchTasks(data.user.id);
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    }
  };

  const fetchTasks = async (userId) => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}&status=In Progress`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchAttendance = async (userId) => {
    try {
      const now = new Date();
      const response = await fetch(
        `/api/attendance?userId=${userId}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`
      );
      const data = await response.json();

      if (data.success) {
        setAttendanceRecords(data.records);

        // Find today's record
        const today = new Date().toDateString();
        const todayRec = data.records.find(
          r => new Date(r.date).toDateString() === today
        );
        setTodayRecord(todayRec || null);

        // Check if currently paused
        if (todayRec && todayRec.workSessions) {
          const lastSession = todayRec.workSessions[todayRec.workSessions.length - 1];
          if (lastSession && !lastSession.endTime) {
            setCurrentWorkSession(lastSession);
            setIsPaused(false);
          } else if (todayRec.checkIn && !todayRec.checkOut) {
            setIsPaused(true);
          }
        }

        // Calculate stats
        const present = data.records.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const late = data.records.filter(r => r.status === 'Late').length;
        const absent = data.records.filter(r => r.status === 'Absent').length;
        const totalHrs = data.records.reduce((sum, r) => sum + (r.totalHours || 0), 0);

        setStats({
          presentDays: present,
          lateDays: late,
          absentDays: absent,
          totalHours: totalHrs,
        });
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'checkin',
          location: 'Office',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Checked in successfully! Status: ${data.status}`);
        fetchAttendance(user.id);
      } else {
        toast.error(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'checkout',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Checked out successfully! Total hours: ${data.totalHours.toFixed(2)}h`);
        setCurrentWorkSession(null);
        setIsPaused(false);
        fetchAttendance(user.id);
      } else {
        toast.error(data.error || 'Failed to check out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartWork = async () => {
    if (!isCustomTask && !selectedTask) {
      toast.error('Please select a task or enter custom work description');
      return;
    }

    if (isCustomTask && !customTaskTitle.trim()) {
      toast.error('Please enter what you are working on');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'start-work',
          taskId: isCustomTask ? null : selectedTask,
          customTaskTitle: isCustomTask ? customTaskTitle.trim() : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Work session started!');
        setShowTaskModal(false);
        setSelectedTask('');
        setCustomTaskTitle('');
        setIsCustomTask(false);
        setIsPaused(false);
        fetchAttendance(user.id);
      } else {
        toast.error(data.error || 'Failed to start work');
      }
    } catch (error) {
      console.error('Error starting work:', error);
      toast.error('Failed to start work');
    } finally {
      setProcessing(false);
    }
  };

  const handlePauseWork = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'pause-work',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Work paused');
        setIsPaused(true);
        setCurrentWorkSession(null);
        fetchAttendance(user.id);
      } else {
        toast.error(data.error || 'Failed to pause work');
      }
    } catch (error) {
      console.error('Error pausing work:', error);
      toast.error('Failed to pause work');
    } finally {
      setProcessing(false);
    }
  };

  const handleResumeWork = () => {
    setShowTaskModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      'Late': 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30',
      'Absent': 'bg-red-500/15 text-red-300 border-red-400/30',
      'Half Day': 'bg-orange-500/15 text-orange-300 border-orange-400/30',
      'On Leave': 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
      'On Duty': 'bg-violet-500/15 text-violet-300 border-violet-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border-slate-400/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Attendance</h1>
              <p className="text-emerald-100">Track your attendance and working hours</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Check-in/out Section */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-xl p-6 mb-6 border border-cyan-400/30">
              <h2 className="text-xl font-bold mb-4 text-white">Today's Attendance</h2>
              
              {todayRecord ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-950/80 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Check-in Time</p>
                      <p className="text-xl font-bold text-slate-100">
                        {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-slate-950/80 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Check-out Time</p>
                      <p className="text-xl font-bold text-slate-100">
                        {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : 'Not yet'}
                      </p>
                    </div>
                    <div className="bg-slate-950/80 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-slate-400">Total Hours</p>
                      <p className="text-xl font-bold text-slate-100">
                        {todayRecord.totalHours ? `${todayRecord.totalHours.toFixed(2)}h` : '0h'}
                      </p>
                    </div>
                  </div>

                  {/* Current Work Session */}
                  {currentWorkSession && (
                    <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Currently Working On:</p>
                          <p className="text-lg font-bold text-slate-100">{currentWorkSession.taskTitle || 'Task'}</p>
                          <p className="text-sm text-slate-400">Started: {new Date(currentWorkSession.startTime).toLocaleTimeString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-700 font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(todayRecord.status)}`}>
                      Status: {todayRecord.status}
                    </span>
                    
                    <div className="flex gap-3">
                      {!todayRecord.checkOut ? (
                        <>
                          {isPaused ? (
                            <button
                              onClick={handleResumeWork}
                              disabled={processing}
                              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <FiPlayCircle className="w-5 h-5" />
                              {processing ? 'Processing...' : 'Resume Work'}
                            </button>
                          ) : currentWorkSession ? (
                            <button
                              onClick={handlePauseWork}
                              disabled={processing}
                              className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <FiPauseCircle className="w-5 h-5" />
                              {processing ? 'Processing...' : 'Pause Work'}
                            </button>
                          ) : (
                            <button
                              onClick={handleResumeWork}
                              disabled={processing}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <FiPlayCircle className="w-5 h-5" />
                              {processing ? 'Processing...' : 'Start Work'}
                            </button>
                          )}
                          
                          <button
                            onClick={handleCheckOut}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition inline-flex items-center gap-2"
                          >
                            <FiXCircle className="w-5 h-5" />
                            {processing ? 'Processing...' : 'Check Out'}
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm text-slate-300">Already checked out today</p>
                          <button
                            onClick={handleCheckIn}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                          >
                            <FiCheckCircle className="w-5 h-5" />
                            {processing ? 'Processing...' : 'Check In Again'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Work Sessions History */}
                  {todayRecord.workSessions && todayRecord.workSessions.length > 0 && (
                    <div className="bg-slate-950/80 rounded-lg p-4 border border-white/10">
                      <h3 className="font-bold text-white mb-3">Today's Work Sessions</h3>
                      <div className="space-y-2">
                        {todayRecord.workSessions.map((session, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/70 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-slate-100">{session.taskTitle || 'Task'}</p>
                              <p className="text-sm text-slate-400">
                                {new Date(session.startTime).toLocaleTimeString()} - {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'Ongoing'}
                              </p>
                            </div>
                            {session.duration && (
                              <span className="text-sm font-semibold text-blue-600">
                                {session.duration.toFixed(2)}h
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiClock className="text-6xl mb-4 mx-auto text-slate-500" />
                  <p className="text-slate-300 mb-4">You haven't checked in today</p>
                  <button
                    onClick={handleCheckIn}
                    disabled={processing}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg transition text-lg inline-flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    {processing ? 'Processing...' : 'Check In Now'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-300">{stats.presentDays}</div>
                <div className="text-sm text-slate-300 mt-1">Present Days</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-300">{stats.lateDays}</div>
                <div className="text-sm text-slate-300 mt-1">Late Days</div>
              </div>
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-300">{stats.absentDays}</div>
                <div className="text-sm text-slate-300 mt-1">Absent Days</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-cyan-300">{stats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-slate-300 mt-1">Total Hours</div>
              </div>
            </div>

            {/* Attendance History */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Attendance History</h2>
              
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xl mb-2">No attendance records</p>
                  <p>Check in to start tracking your attendance</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full">
                    <thead className="bg-slate-900/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Check-in</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Check-out</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/40">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-900/60">
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-100">
                            {record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Selection Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">What are you working on?</h2>
            <p className="text-slate-300 mb-4">Select a task or enter custom work description</p>

            {/* Toggle between task list and custom input */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setIsCustomTask(false);
                  setCustomTaskTitle('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  !isCustomTask
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Select Task
              </button>
              <button
                onClick={() => {
                  setIsCustomTask(true);
                  setSelectedTask('');
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  isCustomTask
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Custom Work
              </button>
            </div>

            {isCustomTask ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Describe what you're working on
                </label>
                <textarea
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  placeholder="e.g., Bug fixing, Research, Documentation, Meeting preparation..."
                  rows="4"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter a brief description of your work activity
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900 rounded-lg border border-white/10">
                    <p className="text-slate-300 mb-2">No active tasks available</p>
                    <p className="text-sm text-slate-400">Switch to "Custom Work" to enter your activity</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTask(task._id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedTask === task._id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 hover:border-cyan-400/50 bg-slate-900/60'
                      }`}
                    >
                      <div className="font-bold text-white">{task.title}</div>
                      <div className="text-sm text-slate-300 mt-1">{task.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span className="text-xs text-slate-400">
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStartWork}
                disabled={(!isCustomTask && !selectedTask && tasks.length > 0) || (isCustomTask && !customTaskTitle.trim()) || processing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                {processing ? 'Starting...' : 'Start Working'}
              </button>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask('');
                  setCustomTaskTitle('');
                  setIsCustomTask(false);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
