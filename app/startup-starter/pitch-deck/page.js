'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Mail, Check, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function PitchDeckSubmission() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('verify'); // verify, upload
  const [verifiedTeam, setVerifiedTeam] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    const loadingToast = toast.loading('Verifying email...');
    setLoading(true);

    try {
      const response = await fetch('/api/startup-starter/verify-team-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Email verified!', { id: loadingToast });
        setVerifiedTeam(data.team);
        setStep('upload');
      } else {
        toast.error(data.error || 'Email verification failed', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to verify email', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF or PowerPoint file');
      return;
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    toast.success('File selected successfully');
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const loadingToast = toast.loading('Uploading pitch deck...');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email.toLowerCase().trim());
      formData.append('teamId', verifiedTeam.teamId);

      const response = await fetch('/api/startup-starter/pitch-deck/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pitch deck uploaded successfully!', { id: loadingToast, duration: 4000 });
        // Reset form
        setTimeout(() => {
          setStep('verify');
          setEmail('');
          setFile(null);
          setVerifiedTeam(null);
        }, 2000);
      } else {
        toast.error(data.error || 'Upload failed', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to upload pitch deck', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
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

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-48 right-10 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-12 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/10 mb-4">
            <FileText className="h-4 w-4" />
            Pitch Deck Submission
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Submit Your Pitch Deck
          </h1>
          <p className="mt-3 text-white/65">
            Upload your team's pitch deck for the Startup Starter event
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 p-6 ring-1 ring-white/10 md:p-8">
            {step === 'verify' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <Mail className="h-6 w-6 text-white/80" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white/90">Verify Your Email</h2>
                    <p className="text-sm text-white/60">Enter your registered email to continue</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                    placeholder="your.email@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-xs text-white/50">
                    Only team members can upload pitch decks
                  </p>
                </div>

                <button
                  onClick={handleVerifyEmail}
                  disabled={loading || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(56,189,248,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 ring-1 ring-emerald-300/20">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/20 ring-1 ring-emerald-300/25">
                      <CheckCircle className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-emerald-200">
                        {verifiedTeam.teamName || `Team ${verifiedTeam.teamNumber}`}
                      </div>
                      {verifiedTeam.startupName && (
                        <div className="text-xs text-emerald-300/70 mt-0.5">
                          {verifiedTeam.startupName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/80">
                    Upload Pitch Deck
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={[
                      'relative rounded-2xl border-2 border-dashed p-8 text-center transition',
                      dragActive
                        ? 'border-indigo-400/50 bg-indigo-400/10'
                        : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8'
                    ].join(' ')}
                  >
                    <input
                      type="file"
                      onChange={handleFileInputChange}
                      accept=".pdf,.ppt,.pptx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    
                    <div className="pointer-events-none">
                      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                        <Upload className="h-8 w-8 text-white/60" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-white/80">
                        {file ? file.name : 'Drop your file here or click to browse'}
                      </p>
                      <p className="mt-2 text-xs text-white/50">
                        PDF or PowerPoint (max 50MB)
                      </p>
                    </div>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-indigo-300" />
                        <div>
                          <div className="text-sm font-medium text-white/90">{file.name}</div>
                          <div className="text-xs text-white/50">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Info Alert */}
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 ring-1 ring-cyan-300/20">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-cyan-200">
                      <p className="font-medium">Important Notes:</p>
                      <ul className="mt-2 space-y-1 text-xs text-cyan-300/80">
                        <li>• Accepted formats: PDF, PPT, PPTX</li>
                        <li>• Maximum file size: 50MB</li>
                        <li>• You can re-upload to replace the previous submission</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep('verify');
                      setFile(null);
                      setVerifiedTeam(null);
                    }}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !file}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(16,185,129,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Submit Pitch Deck
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center"
        >
          <a
            href="/startup-starter/team"
            className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white/90"
          >
            ← Back to Team Dashboard
          </a>
        </motion.div>
      </div>
    </div>
  );
}
