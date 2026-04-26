'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowDownToLine,
  Award,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  Eye,
  EyeOff,
  FileDown,
  LogOut,
  MessageSquare,
  RefreshCw,
  ScanLine,
  Search,
  Shield,
  Shuffle,
  Sunrise,
  Sunset,
  Ticket,
  Trash2,
  User,
  Users,
  X
} from 'lucide-react';

// Dynamically import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import('@/components/QRScanner'), { ssr: false });

export default function StartupStarterAdmin() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState('entry'); // entry, morning, evening
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [teamSize, setTeamSize] = useState(3);
  const [creatingTeams, setCreatingTeams] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('startup_starter_admin_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      fetchRegistrations();
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/startup-starter/teams');
      const data = await response.json();
      if (data.success) {
        setTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check - change this to your desired password
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('startup_starter_admin_auth', 'authenticated');
      setIsAuthenticated(true);
      setAuthError('');
      fetchRegistrations();
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('startup_starter_admin_auth');
    setIsAuthenticated(false);
    setRegistrations([]);
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/startup-starter/registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeams = async () => {
    if (!teamSize || teamSize < 1) {
      setTeamMessage('Please enter a valid team size');
      return;
    }

    try {
      setCreatingTeams(true);
      setTeamMessage('');

      const response = await fetch('/api/startup-starter/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize: parseInt(teamSize) })
      });

      const data = await response.json();

      if (response.ok) {
        setTeamMessage(`✓ ${data.message} with ${data.totalParticipants} participants`);
        fetchRegistrations(); // Refresh to show team assignments
      } else {
        setTeamMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setTeamMessage('✗ Failed to create teams');
    } finally {
      setCreatingTeams(false);
    }
  };

  const handleClearTeams = async () => {
    if (!confirm('Are you sure you want to clear all teams? This cannot be undone.')) {
      return;
    }

    try {
      setCreatingTeams(true);
      setTeamMessage('');

      const response = await fetch('/api/startup-starter/teams', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        setTeamMessage(`✓ ${data.message}`);
        fetchRegistrations(); // Refresh to show cleared teams
      } else {
        setTeamMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setTeamMessage('✗ Failed to clear teams');
    } finally {
      setCreatingTeams(false);
    }
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    setStudentToDelete(studentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    const loadingToast = toast.loading('Deleting student...');

    try {
      const response = await fetch(`/api/startup-starter/registrations/${studentToDelete}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Student deleted successfully`, { id: loadingToast });
        fetchRegistrations();
        setShowDeleteModal(false);
        setStudentToDelete(null);
      } else {
        toast.error(data.error || 'Failed to delete student', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete student', { id: loadingToast });
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllModal(true);
    setDeleteConfirmText('');
  };

  const confirmDeleteAll = async () => {
    if (deleteConfirmText !== 'YES') {
      toast.error('Please type YES to confirm');
      return;
    }

    const loadingToast = toast.loading('Deleting all registrations...');

    try {
      const response = await fetch('/api/startup-starter/registrations', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message, { id: loadingToast, duration: 4000 });
        fetchRegistrations();
        setShowDeleteAllModal(false);
        setDeleteConfirmText('');
      } else {
        toast.error(data.error || 'Failed to delete registrations', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete registrations', { id: loadingToast });
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || reg.department === departmentFilter;

    let matchesFilter = true;
    if (filter === 'verified') matchesFilter = reg.entryVerified;
    else if (filter === 'morning') matchesFilter = reg.morningAttendance;
    else if (filter === 'evening') matchesFilter = reg.eveningAttendance;
    else if (filter === 'complete') matchesFilter = reg.morningAttendance && reg.eveningAttendance;
    else if (filter === 'od-eligible') matchesFilter = reg.morningAttendance && reg.eveningAttendance;
    else if (filter === 'pending') matchesFilter = !reg.morningAttendance || !reg.eveningAttendance;
    
    return matchesSearch && matchesDepartment && matchesFilter;
  });

  // Get unique departments
  const departments = [...new Set(registrations.map(reg => reg.department))].sort();

  const exportToExcel = () => {
    const exportData = filteredRegistrations.map(reg => ({
      'Ticket ID': reg.ticketId,
      'Name': reg.name,
      'Email': reg.email,
      'Roll No': reg.rollNo,
      'Department': reg.department,
      'Phone': reg.phoneNo,
      'College': reg.college,
      'Registered At': new Date(reg.registeredAt).toLocaleString(),
      'Entry Verified': reg.entryVerified ? 'Yes' : 'No',
      'Morning Attendance': reg.morningAttendance ? new Date(reg.morningAttendance).toLocaleString() : 'Not Marked',
      'Evening Attendance': reg.eveningAttendance ? new Date(reg.eveningAttendance).toLocaleString() : 'Not Marked',
      'OD Eligible': (reg.morningAttendance && reg.eveningAttendance) ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
    XLSX.writeFile(wb, `startup-starter-registrations-${Date.now()}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Startup Starter - Registrations', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total: ${filteredRegistrations.length} participants`, 14, 34);

    const tableData = filteredRegistrations.map(reg => [
      reg.ticketId,
      reg.name,
      reg.rollNo,
      reg.department,
      reg.entryVerified ? 'Yes' : 'No',
      reg.morningAttendance ? 'Yes' : 'No',
      reg.eveningAttendance ? 'Yes' : 'No',
      (reg.morningAttendance && reg.eveningAttendance) ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Ticket ID', 'Name', 'Roll No', 'Dept', 'Entry', 'Morning', 'Evening', 'OD']],
      body: tableData,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        4: { halign: 'center' }, // Entry
        5: { halign: 'center' }, // Morning
        6: { halign: 'center' }, // Evening
        7: { halign: 'center' }  // OD
      },
      didParseCell: function(data) {
        // Color code the attendance columns
        if (data.column.index >= 4 && data.section === 'body') {
          if (data.cell.text[0] === 'Yes') {
            data.cell.styles.textColor = [0, 128, 0]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else if (data.cell.text[0] === 'No') {
            data.cell.styles.textColor = [255, 0, 0]; // Red
          }
        }
      }
    });

    doc.save(`startup-starter-registrations-${Date.now()}.pdf`);
  };

  const stats = {
    total: registrations.length,
    entry: registrations.filter(r => r.entryVerified).length,
    morning: registrations.filter(r => r.morningAttendance).length,
    evening: registrations.filter(r => r.eveningAttendance).length,
    od: registrations.filter(r => r.morningAttendance && r.eveningAttendance).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 ring-1 ring-white/15" />
            <div className="space-y-2">
              <div className="h-4 w-56 rounded bg-white/10" />
              <div className="h-3 w-80 rounded bg-white/10" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="h-4 w-24 rounded bg-white/10" />
                <div className="mt-4 h-8 w-16 rounded bg-white/10" />
                <div className="mt-3 h-3 w-28 rounded bg-white/10" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="h-4 w-40 rounded bg-white/10" />
            <div className="mt-4 h-10 w-full rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-40 left-16 h-[520px] w-[520px] rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute right-10 top-24 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
              <div className="rounded-[22px] bg-slate-950/40 p-7 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10">
                      <Shield className="h-3.5 w-3.5" />
                      Admin access
                    </div>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                      Startup Starter
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                      Sign in to manage registrations and attendance.
                    </p>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <ScanLine className="h-6 w-6 text-white/80" />
                  </div>
                </div>

                <form onSubmit={handleLogin} className="mt-7 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Admin password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ring-0 transition focus:border-white/20 focus:bg-white/8"
                      autoFocus
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {authError && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                      >
                        {authError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(56,189,248,.55)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Login
                  </motion.button>

                  <p className="text-xs text-white/45">
                    Tip: set `NEXT_PUBLIC_ADMIN_PASSWORD` in `.env.local`.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-48 right-10 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 px-6 py-6 ring-1 ring-white/10 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Ticket className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Startup Starter Admin
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    Verify entry, track attendance, and export participant lists.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={fetchRegistrations}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/8"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/8"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5"
        >
          <StatCard
            title="Total Registered"
            value={stats.total}
            icon={<Ticket className="h-5 w-5" />}
            accent="from-indigo-500/25 to-cyan-400/10"
          />
          <StatCard
            title="Entry Verified"
            value={stats.entry}
            icon={<BadgeCheck className="h-5 w-5" />}
            accent="from-emerald-500/25 to-cyan-400/10"
          />
          <StatCard
            title="Morning Attendance"
            value={stats.morning}
            icon={<Sunrise className="h-5 w-5" />}
            accent="from-amber-500/25 to-orange-400/10"
          />
          <StatCard
            title="Evening Attendance"
            value={stats.evening}
            icon={<Sunset className="h-5 w-5" />}
            accent="from-orange-500/25 to-rose-400/10"
          />
          <StatCard
            title="OD Eligible"
            value={stats.od}
            icon={<Shield className="h-5 w-5" />}
            accent="from-fuchsia-500/25 to-indigo-400/10"
          />
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 p-5 ring-1 ring-white/10 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <PrimaryButton
                  onClick={() => { setShowScanner(true); setScanType('entry'); }}
                  icon={<ScanLine className="h-4 w-4" />}
                >
                  Scan Entry
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => { setShowScanner(true); setScanType('morning'); }}
                  icon={<Sunrise className="h-4 w-4" />}
                  tone="amber"
                >
                  Morning Scan
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => { setShowScanner(true); setScanType('evening'); }}
                  icon={<Sunset className="h-4 w-4" />}
                  tone="orange"
                >
                  Evening Scan
                </PrimaryButton>
              </div>

              <div className="flex flex-wrap gap-2">
                <SecondaryButton onClick={exportToExcel} icon={<ArrowDownToLine className="h-4 w-4" />}>
                  Export Excel
                </SecondaryButton>
                <SecondaryButton onClick={exportToPDF} icon={<FileDown className="h-4 w-4" />}>
                  Export PDF
                </SecondaryButton>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Team Management */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 p-5 ring-1 ring-white/10 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Users className="h-5 w-5 text-white/80" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white/90">Team Formation</h3>
                <p className="text-sm text-white/60">
                  Create random teams from verified participants
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-white/70 mb-2">
                  Team Size (members per team)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                  placeholder="e.g., 3"
                />
                <p className="mt-1.5 text-xs text-white/50">
                  Last team may have fewer members if participants don't divide evenly
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTeams}
                  disabled={creatingTeams}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(56,189,248,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shuffle className="h-4 w-4" />
                  {creatingTeams ? 'Creating...' : 'Create Teams'}
                </motion.button>

                <button
                  onClick={handleClearTeams}
                  disabled={creatingTeams}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Teams
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {teamMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={[
                    'mt-4 rounded-2xl px-4 py-3 text-sm ring-1',
                    teamMessage.includes('✓')
                      ? 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/20'
                      : 'bg-red-500/10 text-red-100 ring-red-400/20'
                  ].join(' ')}
                >
                  {teamMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <a
                href="/startup-starter/team"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition"
              >
                <Users className="h-4 w-4" />
                View Team Dashboard
                <span className="text-white/40">↗</span>
              </a>

              <button
                onClick={() => {
                  fetchTeams();
                  setShowEvaluationModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400/15 to-orange-400/15 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-amber-300/25 transition hover:from-amber-400/25 hover:to-orange-400/25"
              >
                <Award className="h-4 w-4" />
                Evaluate Teams
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 p-5 ring-1 ring-white/10 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white/90">Filters & Search</h3>
                <p className="mt-1 text-sm text-white/60">
                  Showing <span className="font-semibold text-white/85">{filteredRegistrations.length}</span> of{' '}
                  <span className="font-semibold text-white/85">{registrations.length}</span>
                  {(filter !== 'all' || departmentFilter !== 'all' || searchTerm) ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-200 ring-1 ring-cyan-300/20">
                      Filters active
                    </span>
                  ) : null}
                </p>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setDepartmentFilter('all');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/8"
              >
                Clear
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-white/70">Search</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition focus-within:border-white/20 focus-within:bg-white/8">
                  <Search className="h-4 w-4 text-white/55" />
                  <input
                    type="text"
                    placeholder="Name, email, roll no, ticket ID…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70">Attendance status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="mt-2 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/85 outline-none transition focus:border-white/20 focus:bg-white/8"
                >
                  <option className="bg-slate-950 text-white" value="all">All registrations</option>
                  <option className="bg-slate-950 text-white" value="verified">Entry verified</option>
                  <option className="bg-slate-950 text-white" value="morning">Morning attendance</option>
                  <option className="bg-slate-950 text-white" value="evening">Evening attendance</option>
                  <option className="bg-slate-950 text-white" value="complete">Complete attendance</option>
                  <option className="bg-slate-950 text-white" value="od-eligible">OD eligible</option>
                  <option className="bg-slate-950 text-white" value="pending">Pending attendance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="mt-2 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/85 outline-none transition focus:border-white/20 focus:bg-white/8"
                >
                  <option className="bg-slate-950 text-white" value="all">All departments</option>
                  {departments.map(dept => (
                    <option className="bg-slate-950 text-white" key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowScanner(true)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/8"
                >
                  <Camera className="h-4 w-4" />
                  Open scanner
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Registrations Table */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 overflow-hidden rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Building2 className="h-4 w-4 text-white/60" />
                Registrations
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 text-xs text-white/55">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Exports use current filters
                </div>
                <button
                  onClick={handleDeleteAll}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full">
                <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur">
                  <tr className="border-y border-white/10">
                    <Th>Ticket</Th>
                    <Th>Name</Th>
                    <Th>Roll No</Th>
                    <Th>Department</Th>
                    <ThCenter>Team</ThCenter>
                    <Th>Phone</Th>
                    <ThCenter>Entry</ThCenter>
                    <ThCenter>Morning</ThCenter>
                    <ThCenter>Evening</ThCenter>
                    <ThCenter>OD</ThCenter>
                    <ThCenter>Actions</ThCenter>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredRegistrations.map((reg, idx) => {
                    const odEligible = !!(reg.morningAttendance && reg.eveningAttendance);
                    return (
                      <tr
                        key={reg._id}
                        className={[
                          'transition',
                          idx % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent',
                          'hover:bg-white/[0.05]'
                        ].join(' ')}
                      >
                        <TdMono>{reg.ticketId}</TdMono>
                        <Td>
                          <div className="font-medium text-white/85">{reg.name}</div>
                          <div className="mt-0.5 text-xs text-white/45">{reg.email}</div>
                        </Td>
                        <Td>{reg.rollNo}</Td>
                        <Td>{reg.department}</Td>
                        <TdCenter>
                          {reg.teamNumber ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-400/15 px-2.5 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-300/25">
                              <Users className="h-3 w-3" />
                              {reg.teamNumber}
                            </span>
                          ) : (
                            <span className="text-white/35 text-xs">—</span>
                          )}
                        </TdCenter>
                        <Td>{reg.phoneNo}</Td>
                        <TdCenter>
                          <StatusDot ok={!!reg.entryVerified} />
                        </TdCenter>
                        <TdCenter>
                          <StatusDot ok={!!reg.morningAttendance} />
                        </TdCenter>
                        <TdCenter>
                          <StatusDot ok={!!reg.eveningAttendance} />
                        </TdCenter>
                        <TdCenter>
                          <span className={odEligible ? 'text-emerald-300' : 'text-white/35'}>
                            {odEligible ? '✓' : '—'}
                          </span>
                        </TdCenter>
                        <TdCenter>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewProfile(reg)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white/90"
                              title="View profile"
                            >
                              <User className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(reg._id)}
                              className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                              title="Delete student"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </TdCenter>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {filteredRegistrations.length === 0 && (
          <div className="py-14 text-center text-white/55">
            No registrations found.
          </div>
        )}

        <AnimatePresence>
          {showScanner && (
            <QRScannerModal
              scanType={scanType}
              onClose={() => setShowScanner(false)}
              onSuccess={fetchRegistrations}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEvaluationModal && (
            <EvaluationModal
              teams={teams}
              onClose={() => setShowEvaluationModal(false)}
              onSuccess={() => {
                fetchTeams();
                setShowEvaluationModal(false);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProfileModal && selectedStudent && (
            <StudentProfileModal
              student={selectedStudent}
              onClose={() => {
                setShowProfileModal(false);
                setSelectedStudent(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteModal && (
            <DeleteConfirmModal
              title="Delete Student"
              message="Are you sure you want to delete this student? This action cannot be undone."
              onConfirm={confirmDeleteStudent}
              onCancel={() => {
                setShowDeleteModal(false);
                setStudentToDelete(null);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDeleteAllModal && (
            <DeleteAllConfirmModal
              confirmText={deleteConfirmText}
              setConfirmText={setDeleteConfirmText}
              onConfirm={confirmDeleteAll}
              onCancel={() => {
                setShowDeleteAllModal(false);
                setDeleteConfirmText('');
              }}
              totalCount={registrations.length}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EvaluationModal({ teams, onClose, onSuccess }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [problemScore, setProblemScore] = useState(0);
  const [solutionScore, setSolutionScore] = useState(0);
  const [businessModelScore, setBusinessModelScore] = useState(0);
  const [pitchScore, setPitchScore] = useState(0);
  const [innovationScore, setInnovationScore] = useState(0);
  const [adminComments, setAdminComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  // Filter teams based on search
  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    return (
      team.teamNumber.toString().includes(searchLower) ||
      (team.teamName && team.teamName.toLowerCase().includes(searchLower)) ||
      (team.startupName && team.startupName.toLowerCase().includes(searchLower))
    );
  });

  const totalScore = (
    parseFloat(problemScore) +
    parseFloat(solutionScore) +
    parseFloat(businessModelScore) +
    parseFloat(pitchScore) +
    parseFloat(innovationScore)
  );

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    if (team.evaluation) {
      setProblemScore(team.evaluation.problemScore || 0);
      setSolutionScore(team.evaluation.solutionScore || 0);
      setBusinessModelScore(team.evaluation.businessModelScore || 0);
      setPitchScore(team.evaluation.pitchScore || 0);
      setInnovationScore(team.evaluation.innovationScore || 0);
      setAdminComments(team.evaluation.adminComments || '');
    } else {
      setProblemScore(0);
      setSolutionScore(0);
      setBusinessModelScore(0);
      setPitchScore(0);
      setInnovationScore(0);
      setAdminComments('');
    }
    setMessage('');
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTeam) return;

    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/startup-starter/teams/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeam.teamId,
          problemScore,
          solutionScore,
          businessModelScore,
          pitchScore,
          innovationScore,
          adminComments,
          evaluatedBy: 'Admin'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✓ Evaluation saved successfully');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAllResults = async (publish) => {
    try {
      setPublishLoading(true);
      setPublishMessage('');

      const response = await fetch('/api/startup-starter/teams/publish-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish })
      });

      const data = await response.json();

      if (response.ok) {
        setPublishMessage(`✓ ${data.message}`);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setPublishMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setPublishMessage('✗ Failed to update results status');
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10 max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/80 backdrop-blur px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Award className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white/90">
                    Shark Tank Evaluation
                  </h2>
                  <p className="text-xs text-white/60">
                    Evaluate teams and publish results
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Team List */}
                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/80">Select Team</h3>
                    <span className="text-xs text-white/50">{filteredTeams.length} teams</span>
                  </div>
                  
                  {/* Search Input */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 transition focus-within:border-white/20 focus-within:bg-white/8">
                      <Search className="h-4 w-4 text-white/55" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search teams..."
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredTeams.length === 0 ? (
                      <div className="text-center py-8 text-white/50 text-sm">
                        No teams found
                      </div>
                    ) : (
                      filteredTeams.map((team) => (
                        <button
                          key={team.teamId}
                          onClick={() => handleSelectTeam(team)}
                          className={[
                            'w-full text-left rounded-2xl border px-4 py-3 transition',
                            selectedTeam?.teamId === team.teamId
                              ? 'border-indigo-400/50 bg-indigo-400/15 ring-1 ring-indigo-300/25'
                              : 'border-white/10 bg-white/5 hover:bg-white/8'
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white/90 text-sm truncate">
                                {team.teamName || `Team ${team.teamNumber}`}
                              </div>
                              {team.startupName && (
                                <div className="text-xs text-white/60 truncate mt-0.5">
                                  {team.startupName}
                                </div>
                              )}
                            </div>
                            {team.evaluation && (
                              <div className="flex-shrink-0 rounded-lg bg-amber-400/15 px-2 py-1 text-xs font-bold text-amber-200">
                                {team.evaluation.totalScore}/50
                              </div>
                            )}
                          </div>
                          {team.resultsPublished && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
                              <Eye className="h-3 w-3" />
                              Published
                            </div>
                          )}
                          {!team.resultsPublished && team.evaluation && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/50 ring-1 ring-white/10">
                              <EyeOff className="h-3 w-3" />
                              Not Published
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Evaluation Form */}
                <div className="lg:col-span-2">
                  {selectedTeam ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <h3 className="text-base font-semibold text-white/90">
                          {selectedTeam.teamName || `Team ${selectedTeam.teamNumber}`}
                        </h3>
                        {selectedTeam.startupName && (
                          <p className="text-sm text-white/65 mt-1">{selectedTeam.startupName}</p>
                        )}
                        <p className="text-xs text-white/50 mt-2">
                          {selectedTeam.members.length} members
                        </p>
                      </div>

                      <div className="space-y-3">
                        <ScoreInput
                          label="Problem Identification"
                          value={problemScore}
                          onChange={setProblemScore}
                        />
                        <ScoreInput
                          label="Solution Design"
                          value={solutionScore}
                          onChange={setSolutionScore}
                        />
                        <ScoreInput
                          label="Business Model"
                          value={businessModelScore}
                          onChange={setBusinessModelScore}
                        />
                        <ScoreInput
                          label="Pitch Quality"
                          value={pitchScore}
                          onChange={setPitchScore}
                        />
                        <ScoreInput
                          label="Innovation"
                          value={innovationScore}
                          onChange={setInnovationScore}
                        />
                      </div>

                      <div className="rounded-2xl bg-gradient-to-r from-amber-400/15 to-orange-400/15 px-4 py-3 ring-1 ring-amber-300/25">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-amber-200">Total Score</span>
                          <span className="text-2xl font-bold text-amber-100">{totalScore}/50</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                          Admin Comments (Feedback for team)
                        </label>
                        <textarea
                          value={adminComments}
                          onChange={(e) => setAdminComments(e.target.value)}
                          placeholder="Provide constructive feedback to help the team grow..."
                          rows={4}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8 resize-none"
                        />
                      </div>

                      <AnimatePresence>
                        {message && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className={[
                              'rounded-2xl px-4 py-3 text-sm ring-1',
                              message.includes('✓')
                                ? 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/20'
                                : 'bg-red-500/10 text-red-100 ring-red-400/20'
                            ].join(' ')}
                          >
                            {message}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        onClick={handleSaveEvaluation}
                        disabled={loading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(56,189,248,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Award className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Evaluation'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20 text-center">
                      <div>
                        <Award className="h-16 w-16 text-white/30 mx-auto" />
                        <p className="mt-4 text-white/60">Select a team to evaluate</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Publish Button */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <AnimatePresence>
                  {publishMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={[
                        'mb-4 rounded-2xl px-4 py-3 text-sm ring-1',
                        publishMessage.includes('✓')
                          ? 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/20'
                          : 'bg-red-500/10 text-red-100 ring-red-400/20'
                      ].join(' ')}
                    >
                      {publishMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white/90">Publish All Results</h3>
                    <p className="text-xs text-white/60 mt-1">
                      Make all evaluations visible to teams at once
                    </p>
                  </div>
                  
                  {teams.some(t => t.resultsPublished) ? (
                    <button
                      onClick={() => handlePublishAllResults(false)}
                      disabled={publishLoading}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/8 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <EyeOff className="h-4 w-4" />
                      {publishLoading ? 'Unpublishing...' : 'Unpublish All Results'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePublishAllResults(true)}
                      disabled={publishLoading}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(16,185,129,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="h-4 w-4" />
                      {publishLoading ? 'Publishing...' : 'Publish All Results'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ScoreInput({ label, value, onChange }) {
  const handleChange = (e) => {
    let newValue = parseFloat(e.target.value);
    
    // Ensure value doesn't exceed 10
    if (newValue > 10) {
      newValue = 10;
    }
    
    // Ensure value is not negative
    if (newValue < 0) {
      newValue = 0;
    }
    
    onChange(newValue || 0);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="flex-1 text-sm font-medium text-white/80">{label}</label>
      <input
        type="number"
        min="0"
        max="10"
        step="0.5"
        value={value}
        onChange={handleChange}
        onBlur={(e) => {
          // Ensure value is within bounds on blur
          let val = parseFloat(e.target.value) || 0;
          if (val > 10) val = 10;
          if (val < 0) val = 0;
          onChange(val);
        }}
        className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-semibold text-white outline-none transition focus:border-white/20 focus:bg-white/8"
      />
      <span className="text-xs text-white/50 w-8">/10</span>
    </div>
  );
}

function QRScannerModal({ scanType, onClose, onSuccess }) {
  const [manualTicketId, setManualTicketId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleVerify = async (ticketId) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/startup-starter/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          scanType
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✓ ${data.message}`);
        setManualTicketId('');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage(`✗ ${data.error}`);
      }
    } catch (error) {
      setMessage('✗ Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = () => {
    if (!manualTicketId.trim()) return;
    handleVerify(manualTicketId);
  };

  const handleQRScan = (data) => {
    setShowCamera(false);
    const ticketId = data.ticketId || data;
    setManualTicketId(ticketId);
    handleVerify(ticketId);
  };

  const scanTypeLabels = {
    entry: 'Entry Verification',
    morning: 'Morning Attendance',
    evening: 'Evening Attendance'
  };

  return (
    <>
      {showCamera && (
        <QRScanner
          onScan={handleQRScan}
          onError={(error) => {
            setMessage(`✗ ${error}`);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="w-full max-w-lg rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/55 p-6 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/75 ring-1 ring-white/10">
                  <ScanLine className="h-3.5 w-3.5" />
                  Scanner
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-white/90">
                  {scanTypeLabels[scanType]}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  Scan a QR code or enter a ticket ID manually.
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/8"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCamera(true)}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Camera className="h-4 w-4" />
                Scan with camera
              </motion.button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="rounded-full bg-slate-950/40 px-2 py-0.5 text-white/45 ring-1 ring-white/10">
                    OR
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-white/70">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
                  placeholder="SS-XXXXXXXXXX"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                />
              </div>

              <AnimatePresence initial={false}>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={[
                      'rounded-2xl px-4 py-3 text-sm ring-1',
                      message.includes('✓')
                        ? 'bg-emerald-500/10 text-emerald-100 ring-emerald-400/20'
                        : 'bg-red-500/10 text-red-100 ring-red-400/20'
                    ].join(' ')}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleManualVerify}
                disabled={loading || !manualTicketId.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                {loading ? 'Verifying…' : 'Verify ticket'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

function StatCard({ title, value, icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
    >
      <div className="rounded-[22px] bg-slate-950/40 p-5 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-medium text-white/60">{title}</div>
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/5 text-white/75 ring-1 ring-white/10">
            {icon}
          </div>
        </div>
        <div className="mt-4 text-3xl font-semibold tracking-tight text-white/90">
          {value}
        </div>
        <div className="mt-1 text-xs text-white/45">Updated live</div>
      </div>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
    </motion.div>
  );
}

function PrimaryButton({ children, onClick, icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'from-indigo-400 to-cyan-300 shadow-[0_18px_40px_-22px_rgba(56,189,248,.5)]',
    amber: 'from-amber-300 to-orange-300 shadow-[0_18px_40px_-22px_rgba(251,191,36,.35)]',
    orange: 'from-orange-300 to-rose-300 shadow-[0_18px_40px_-22px_rgba(251,113,133,.30)]'
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r px-4 py-2.5 text-sm font-semibold text-slate-950 transition ${tones[tone] || tones.indigo}`}
    >
      {icon}
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/8"
    >
      {icon}
      {children}
    </button>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-white/55">
      {children}
    </th>
  );
}

function ThCenter({ children }) {
  return (
    <th className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-white/55">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-4 py-3 align-top text-sm text-white/75">{children}</td>;
}

function TdMono({ children }) {
  return (
    <td className="px-4 py-3 align-top font-mono text-xs text-white/70">
      {children}
    </td>
  );
}

function TdCenter({ children }) {
  return <td className="px-4 py-3 text-center text-sm text-white/75">{children}</td>;
}

function StatusDot({ ok }) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center',
        'h-7 w-7 rounded-full ring-1',
        ok
          ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/25'
          : 'bg-white/5 text-white/35 ring-white/10'
      ].join(' ')}
      title={ok ? 'Marked' : 'Not marked'}
    >
      {ok ? '✓' : '—'}
    </span>
  );
}

function DeleteConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-red-500/15 ring-1 ring-red-400/25">
                  <Trash2 className="h-6 w-6 text-red-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white/90">{title}</h3>
                  <p className="mt-2 text-sm text-white/65">{message}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(239,68,68,.5)] transition hover:from-red-600 hover:to-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DeleteAllConfirmModal({ confirmText, setConfirmText, onConfirm, onCancel, totalCount }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-red-500/15 ring-1 ring-red-400/25">
                  <Trash2 className="h-6 w-6 text-red-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white/90">Delete All Registrations</h3>
                  <p className="mt-2 text-sm text-white/65">
                    ⚠️ This will permanently delete <span className="font-bold text-red-300">{totalCount}</span> registrations. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 ring-1 ring-red-400/20">
                  <p className="text-sm font-medium text-red-200">
                    Type <span className="font-mono font-bold">YES</span> to confirm deletion
                  </p>
                </div>

                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type YES"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-red-400/50 focus:bg-white/8"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={onCancel}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={confirmText !== 'YES'}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(239,68,68,.5)] transition hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StudentProfileModal({ student, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10 max-h-[88vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-slate-950/80 backdrop-blur px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <User className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white/90">
                    Student Profile
                  </h2>
                  <p className="text-xs text-white/60">
                    Complete registration details
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Full Name" value={student.name} />
                  <InfoItem label="Ticket ID" value={student.ticketId} mono />
                  <InfoItem label="Email" value={student.email} />
                  <InfoItem label="Phone Number" value={student.phoneNo} />
                  <InfoItem label="Roll Number" value={student.rollNo} />
                  <InfoItem label="Department" value={student.department} />
                  <InfoItem label="College" value={student.college} className="md:col-span-2" />
                </div>
              </div>

              {/* Team Info */}
              {student.teamNumber && (
                <div className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 p-5 ring-1 ring-indigo-300/20">
                  <h3 className="text-sm font-semibold text-indigo-200 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Assignment
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="Team Number" value={student.teamNumber} light />
                    <InfoItem label="Team ID" value={student.teamId} mono light />
                  </div>
                </div>
              )}

              {/* Attendance Info */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Attendance Records
                </h3>
                <div className="space-y-3">
                  <AttendanceItem
                    label="Entry Verified"
                    verified={student.entryVerified}
                    timestamp={student.entryVerifiedAt}
                  />
                  <AttendanceItem
                    label="Morning Attendance"
                    verified={student.morningAttendance}
                    timestamp={student.morningAttendance}
                  />
                  <AttendanceItem
                    label="Evening Attendance"
                    verified={student.eveningAttendance}
                    timestamp={student.eveningAttendance}
                  />
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">OD Eligible</span>
                      <span className={[
                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1',
                        (student.morningAttendance && student.eveningAttendance)
                          ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/25'
                          : 'bg-white/5 text-white/50 ring-white/10'
                      ].join(' ')}>
                        {(student.morningAttendance && student.eveningAttendance) ? (
                          <>
                            <Check className="h-3 w-3" />
                            Eligible
                          </>
                        ) : (
                          <>Not Eligible</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white/80 mb-4">Registration Details</h3>
                <div className="space-y-2">
                  <InfoItem 
                    label="Registered At" 
                    value={new Date(student.registeredAt).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })} 
                  />
                  <InfoItem 
                    label="Database ID" 
                    value={student._id} 
                    mono 
                  />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ label, value, mono = false, light = false, className = '' }) {
  return (
    <div className={className}>
      <div className={`text-xs font-medium mb-1 ${light ? 'text-indigo-300/70' : 'text-white/60'}`}>
        {label}
      </div>
      <div className={[
        'text-sm font-medium',
        light ? 'text-indigo-100' : 'text-white/90',
        mono ? 'font-mono text-xs' : ''
      ].join(' ')}>
        {value || '—'}
      </div>
    </div>
  );
}

function AttendanceItem({ label, verified, timestamp }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-white/70">{label}</span>
      <div className="flex items-center gap-3">
        {timestamp && (
          <span className="text-xs text-white/50">
            {new Date(timestamp).toLocaleString('en-IN', {
              dateStyle: 'short',
              timeStyle: 'short'
            })}
          </span>
        )}
        <span className={[
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
          verified
            ? 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/25'
            : 'bg-white/5 text-white/50 ring-white/10'
        ].join(' ')}>
          {verified ? (
            <>
              <Check className="h-3 w-3" />
              Marked
            </>
          ) : (
            <>Not Marked</>
          )}
        </span>
      </div>
    </div>
  );
}
