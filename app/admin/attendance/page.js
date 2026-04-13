'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiActivity, FiArrowLeft, FiCalendar, FiClock } from 'react-icons/fi';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchAttendance();
  }, [filter]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `/api/attendance?month=${filter.month}&year=${filter.year}`
      );
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
      'Late': 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/30',
      'Absent': 'bg-red-500/15 text-red-300 border border-red-400/30',
      'Half Day': 'bg-orange-500/15 text-orange-300 border border-orange-400/30',
      'On Leave': 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30',
      'On Duty': 'bg-violet-500/15 text-violet-300 border border-violet-400/30',
    };
    return colors[status] || 'bg-slate-500/15 text-slate-300 border border-slate-400/30';
  };

  const stats = {
    present: records.filter(r => r.status === 'Present' || r.status === 'Late').length,
    late: records.filter(r => r.status === 'Late').length,
    absent: records.filter(r => r.status === 'Absent').length,
    totalHours: records.reduce((sum, r) => sum + (r.totalHours || 0), 0),
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Attendance Management</h1>
              <p className="text-emerald-100">Monitor intern attendance records</p>
            </div>
            <Link href="/admin">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 flex gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Month
                </label>
                <select
                  value={filter.month}
                  onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
                  className="px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Year
                </label>
                <select
                  value={filter.year}
                  onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
                  className="px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 text-center">
                <FiActivity className="mx-auto text-emerald-300 mb-2" />
                <div className="text-3xl font-bold text-emerald-300">{stats.present}</div>
                <div className="text-sm text-slate-300 mt-1">Present Days</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4 text-center">
                <FiClock className="mx-auto text-yellow-300 mb-2" />
                <div className="text-3xl font-bold text-yellow-300">{stats.late}</div>
                <div className="text-sm text-slate-300 mt-1">Late Arrivals</div>
              </div>
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 text-center">
                <FiCalendar className="mx-auto text-red-300 mb-2" />
                <div className="text-3xl font-bold text-red-300">{stats.absent}</div>
                <div className="text-sm text-slate-300 mt-1">Absent Days</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 text-center">
                <FiClock className="mx-auto text-cyan-300 mb-2" />
                <div className="text-3xl font-bold text-cyan-300">{stats.totalHours.toFixed(1)}</div>
                <div className="text-sm text-slate-300 mt-1">Total Hours</div>
              </div>
            </div>

            {/* Attendance Table */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-white">Attendance Records</h2>
              
              {records.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FiCalendar className="text-6xl mb-4 mx-auto text-slate-500" />
                  <p className="text-xl mb-2">No attendance records</p>
                  <p>Records will appear when interns check in</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full">
                    <thead className="bg-slate-900/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Check-in</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Check-out</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-slate-950/40">
                      {records.map((record) => (
                        <tr key={record._id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-white">
                            {record.userId}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-200">
                            {record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">
                            {record.location || '-'}
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
    </div>
  );
}
