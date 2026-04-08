'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
      'Present': 'bg-green-100 text-green-800 border-green-300',
      'Late': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Absent': 'bg-red-100 text-red-800 border-red-300',
      'Half Day': 'bg-orange-100 text-orange-800 border-orange-300',
      'On Leave': 'bg-blue-100 text-blue-800 border-blue-300',
      'On Duty': 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Attendance</h1>
              <p className="text-green-100">Track your attendance and working hours</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition">
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Check-in/out Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold mb-4">Today's Attendance</h2>
              
              {todayRecord ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Check-in Time</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Check-out Time</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : 'Not yet'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Hours</p>
                      <p className="text-xl font-bold text-gray-900">
                        {todayRecord.totalHours ? `${todayRecord.totalHours.toFixed(2)}h` : '0h'}
                      </p>
                    </div>
                  </div>

                  {/* Current Work Session */}
                  {currentWorkSession && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Currently Working On:</p>
                          <p className="text-lg font-bold text-gray-900">{currentWorkSession.taskTitle || 'Task'}</p>
                          <p className="text-sm text-gray-500">Started: {new Date(currentWorkSession.startTime).toLocaleTimeString()}</p>
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
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {processing ? 'Processing...' : 'Resume Work'}
                            </button>
                          ) : currentWorkSession ? (
                            <button
                              onClick={handlePauseWork}
                              disabled={processing}
                              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {processing ? 'Processing...' : 'Pause Work'}
                            </button>
                          ) : (
                            <button
                              onClick={handleResumeWork}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {processing ? 'Processing...' : 'Start Work'}
                            </button>
                          )}
                          
                          <button
                            onClick={handleCheckOut}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2 px-6 rounded-lg transition"
                          >
                            {processing ? 'Processing...' : 'Check Out'}
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-sm text-gray-600">Already checked out today</p>
                          <button
                            onClick={handleCheckIn}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            {processing ? 'Processing...' : 'Check In Again'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Work Sessions History */}
                  {todayRecord.workSessions && todayRecord.workSessions.length > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-3">Today's Work Sessions</h3>
                      <div className="space-y-2">
                        {todayRecord.workSessions.map((session, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{session.taskTitle || 'Task'}</p>
                              <p className="text-sm text-gray-600">
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
                  <div className="text-6xl mb-4">⏰</div>
                  <p className="text-gray-600 mb-4">You haven't checked in today</p>
                  <button
                    onClick={handleCheckIn}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
                  >
                    {processing ? 'Processing...' : 'Check In Now'}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.presentDays}</div>
                <div className="text-sm text-gray-600 mt-1">Present Days</div>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.lateDays}</div>
                <div className="text-sm text-gray-600 mt-1">Late Days</div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-600">{stats.absentDays}</div>
                <div className="text-sm text-gray-600 mt-1">Absent Days</div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-gray-600 mt-1">Total Hours</div>
              </div>
            </div>

            {/* Attendance History */}
            <div>
              <h2 className="text-xl font-bold mb-4">Attendance History</h2>
              
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl mb-2">No attendance records</p>
                  <p>Check in to start tracking your attendance</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check-out</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hours</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">What are you working on?</h2>
            <p className="text-gray-600 mb-4">Select a task or enter custom work description</p>

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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Work
              </button>
            </div>

            {isCustomTask ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you're working on
                </label>
                <textarea
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  placeholder="e.g., Bug fixing, Research, Documentation, Meeting preparation..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a brief description of your work activity
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-2">No active tasks available</p>
                    <p className="text-sm text-gray-400">Switch to "Custom Work" to enter your activity</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <button
                      key={task._id}
                      onClick={() => setSelectedTask(task._id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedTask === task._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span className="text-xs text-gray-500">
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
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
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
