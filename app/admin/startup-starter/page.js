'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownToLine,
  BadgeCheck,
  Building2,
  Camera,
  FileDown,
  LogOut,
  RefreshCw,
  ScanLine,
  Search,
  Shield,
  Sunrise,
  Sunset,
  Ticket
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

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('startup_starter_admin_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      fetchRegistrations();
    } else {
      setLoading(false);
    }
  }, []);

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

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35, ease: 'easeOut' }}
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
          transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 overflow-hidden rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 px-5 py-4 md:px-6">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Building2 className="h-4 w-4 text-white/60" />
                Registrations
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-white/55">
                <ArrowDownToLine className="h-3.5 w-3.5" />
                Exports use current filters
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur">
                  <tr className="border-y border-white/10">
                    <Th>Ticket</Th>
                    <Th>Name</Th>
                    <Th>Roll No</Th>
                    <Th>Department</Th>
                    <Th>Phone</Th>
                    <ThCenter>Entry</ThCenter>
                    <ThCenter>Morning</ThCenter>
                    <ThCenter>Evening</ThCenter>
                    <ThCenter>OD</ThCenter>
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
      </div>
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
