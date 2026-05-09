'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/verify-admin');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setLoginForm({ username: '', password: '' });
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error occurred');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin-auth', { method: 'DELETE' });
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin"></div>
            <div className="w-16 h-16 rounded-full border-r-2 border-b-2 border-purple-500 animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

        <div className="max-w-md w-full relative z-10">
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-3xl shadow-2xl p-10">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
                  TB
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-tight">
                Admin Portal
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Secure Authentication Required
              </p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-sans"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-sans"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn || !loginForm.username || !loginForm.password}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 disabled:from-blue-600/50 disabled:to-purple-600/50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition duration-300 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out disabled:hidden"></div>
                <span className="relative z-10 flex items-center">
                  {loggingIn ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    'Secure Login'
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const navCards = [
    { name: 'Applications', href: '/admin/applications', icon: '📋', desc: 'Review active internship submissions', color: 'from-blue-500/20 to-cyan-500/20', hoverBorder: 'hover:border-cyan-500/50', iconColor: 'text-cyan-400' },
    { name: 'Clients', href: '/admin/clients', icon: '👤', desc: 'Manage client database and contacts', color: 'from-blue-500/20 to-indigo-500/20', hoverBorder: 'hover:border-blue-500/50', iconColor: 'text-blue-400' },
    { name: 'Quotations', href: '/admin/quotations', icon: '💰', desc: 'Create and manage client quotations', color: 'from-emerald-500/20 to-green-500/20', hoverBorder: 'hover:border-emerald-500/50', iconColor: 'text-emerald-400' },
    { name: 'Invoices', href: '/admin/invoices', icon: '🧾', desc: 'Track payments and billing records', color: 'from-green-500/20 to-emerald-500/20', hoverBorder: 'hover:border-green-500/50', iconColor: 'text-green-400' },
    { name: 'Templates', href: '/admin/templates', icon: '📄', desc: 'Manage system document templates', color: 'from-purple-500/20 to-pink-500/20', hoverBorder: 'hover:border-pink-500/50', iconColor: 'text-pink-400' },
    { name: 'Tasks', href: '/admin/tasks', icon: '✅', desc: 'Monitor and assign intern tasks', color: 'from-emerald-500/20 to-teal-500/20', hoverBorder: 'hover:border-teal-500/50', iconColor: 'text-teal-400' },
    { name: 'Interns', href: '/admin/interns', icon: '👥', desc: 'Directory of current team members', color: 'from-indigo-500/20 to-blue-500/20', hoverBorder: 'hover:border-blue-500/50', iconColor: 'text-blue-400' },
    { name: 'Messages', href: '/admin/messages', icon: '💬', desc: 'Internal communication hub', color: 'from-rose-500/20 to-red-500/20', hoverBorder: 'hover:border-red-500/50', iconColor: 'text-rose-400' },
    { name: 'Attendance', href: '/admin/attendance', icon: '⏰', desc: 'Time tracking and presence logs', color: 'from-amber-500/20 to-orange-500/20', hoverBorder: 'hover:border-orange-500/50', iconColor: 'text-orange-400' },
    { name: 'Leaves', href: '/admin/leaves', icon: '🏖️', desc: 'Time-off requests & approvals', color: 'from-fuchsia-500/20 to-purple-500/20', hoverBorder: 'hover:border-purple-500/50', iconColor: 'text-fuchsia-400' },
    { name: 'Leaderboard', href: '/admin/leaderboard', icon: '🏆', desc: 'Performance rankings & metrics', color: 'from-yellow-500/20 to-amber-500/20', hoverBorder: 'hover:border-yellow-400/50', iconColor: 'text-yellow-400' },
    { name: 'Positions', href: '/admin/positions', icon: '💼', desc: 'Open roles and requirements', color: 'from-sky-500/20 to-blue-500/20', hoverBorder: 'hover:border-sky-500/50', iconColor: 'text-sky-400' },
    { name: 'Doc Generator', href: '/dynamic-template', icon: '🔧', desc: 'Advanced document automation', color: 'from-lime-500/20 to-green-500/20', hoverBorder: 'hover:border-lime-500/50', iconColor: 'text-lime-400' },
    { name: 'Quick Doc', href: '/appointment-simple', icon: '📝', desc: 'Fast appointment letter generation', color: 'from-violet-500/20 to-purple-500/20', hoverBorder: 'hover:border-violet-500/50', iconColor: 'text-violet-400' },
    { name: 'Apply Portal', href: '/apply-internship', icon: '🎯', desc: 'External application frontend', color: 'from-red-500/20 to-orange-500/20', hoverBorder: 'hover:border-red-500/50', iconColor: 'text-red-400' },
    { name: 'Main Site', href: '/', icon: '🏠', desc: 'Public facing company website', color: 'from-zinc-500/20 to-slate-500/20', hoverBorder: 'hover:border-slate-400/50', iconColor: 'text-slate-300' },
    { name: 'Debug', href: '/admin/debug', icon: '⚙️', desc: 'System health and diagnostics', color: 'from-red-600/20 to-rose-600/20', hoverBorder: 'hover:border-red-500/50', iconColor: 'text-red-500' },
    { name: 'Migration', href: '/admin/migrate', icon: '☁️', desc: 'Data transfer and cloud sync', color: 'from-yellow-600/20 to-orange-600/20', hoverBorder: 'hover:border-yellow-500/50', iconColor: 'text-yellow-500' },
  ];

  // Admin dashboard
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/20">
              TB
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Command Center</h1>
              <p className="text-xs text-gray-400 font-medium tracking-wider uppercase">Tech Buddy Space</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold text-gray-300 hover:text-white"
          >
            <svg className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                <h3 className="text-xl font-bold text-white">Optimal</h3>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl group-hover:scale-110 transition-transform">✓</div>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Network Traffic</p>
              <h3 className="text-xl font-bold text-white">Encrypted</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">🔐</div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Active Modules</p>
              <h3 className="text-xl font-bold text-white">{navCards.length} Online</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl group-hover:scale-110 transition-transform">⚡</div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Modules & Tools</h2>
          <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1 ml-6"></div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {navCards.map((card, idx) => (
            <Link key={idx} href={card.href}>
              <div className={`group relative h-40 bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300 ${card.hoverBorder} overflow-hidden cursor-pointer flex flex-col justify-between`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-full translate-x-10 -translate-y-10`}></div>
                
                <div className="flex items-start justify-between relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-xl shadow-inner ${card.iconColor}`}>
                    {card.icon}
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-gray-200 group-hover:text-white mb-1 transition-colors">{card.name}</h3>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-2">{card.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
      </main>
    </div>
  );
}