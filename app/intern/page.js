'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiLoader, FiLock, FiMail } from 'react-icons/fi';

export default function InternLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/intern-auth/verify');
      if (response.ok) {
        router.push('/intern/dashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/intern-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user data in localStorage
        localStorage.setItem('internUser', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/intern/dashboard');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070f] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-cyan-500/20 blur-[110px] pointer-events-none"></div>
      <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-violet-500/20 blur-[110px] pointer-events-none"></div>
      <div className="max-w-md w-full relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl p-4 mb-4 text-3xl shadow-lg shadow-cyan-500/30">
            🎓
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            TechBuddySpace
          </h1>
          <p className="text-slate-300">Intern Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Welcome Back!
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:from-cyan-800 disabled:to-violet-800 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Need help? Contact your administrator
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <a href="/" className="text-slate-300 hover:text-white text-sm inline-flex items-center gap-2">
            <FiArrowLeft /> Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
