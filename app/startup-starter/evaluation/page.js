'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Mail, Check, AlertCircle, MessageSquare, TrendingUp, Loader2, Target, Lightbulb, Briefcase, Presentation, Sparkles } from 'lucide-react';

export default function EvaluationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/startup-starter/evaluation/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.evaluation && data.resultsPublished) {
          setEvaluation(data.evaluation);
          setTeamInfo({
            teamName: data.teamName,
            teamNumber: data.teamNumber,
            startupName: data.startupName
          });
        } else if (!data.resultsPublished) {
          setError('Evaluation results have not been published yet');
        } else {
          setError('No evaluation found for your team');
        }
      } else {
        setError(data.error || 'Failed to fetch evaluation');
      }
    } catch (error) {
      setError('Failed to fetch evaluation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setEvaluation(null);
    setTeamInfo(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-48 right-10 h-[560px] w-[560px] rounded-full bg-orange-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-8 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
        >
          <div className="rounded-[22px] bg-slate-950/40 px-6 py-6 ring-1 ring-white/10 md:px-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 ring-1 ring-white/10">
                <Award className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Shark Tank Evaluation
                </h1>
                <p className="mt-1 text-sm text-white/65">
                  View your team's evaluation results and feedback
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          className="mt-6"
        >
          {!evaluation ? (
            // Email Verification Form
            <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
              <div className="rounded-[22px] bg-slate-950/40 p-8 ring-1 ring-white/10">
                <div className="mx-auto max-w-md">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 ring-1 ring-white/10 mb-4">
                      <Mail className="h-8 w-8 text-amber-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-white/90">
                      Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-white/60">
                      Enter your registered email to view your team's evaluation
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white/80">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 transition focus-within:border-white/20 focus-within:bg-white/8">
                        <Mail className="h-4 w-4 text-white/55" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                          placeholder="your.email@example.com"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 ring-1 ring-red-400/20"
                        >
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-300" />
                            <p className="text-sm text-red-200">{error}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleVerifyEmail}
                      disabled={loading || !email.trim()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(251,191,36,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          View Evaluation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Evaluation Results
            <div className="space-y-6">
              {/* Team Info */}
              <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
                <div className="rounded-[22px] bg-slate-950/40 p-6 ring-1 ring-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white/90">
                        {teamInfo.teamName || `Team ${teamInfo.teamNumber}`}
                      </h2>
                      {teamInfo.startupName && (
                        <p className="mt-1 text-sm text-white/65">{teamInfo.startupName}</p>
                      )}
                    </div>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/8"
                    >
                      View Another Team
                    </button>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
                <div className="rounded-[22px] bg-slate-950/40 p-6 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-5">
                    <Award className="h-5 w-5 text-amber-300" />
                    <h3 className="text-lg font-semibold text-white/90">Evaluation Scores</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <ScoreCard 
                      label="Problem Identification" 
                      score={evaluation.problemScore}
                      icon={<Target className="h-4 w-4" />}
                      color="from-red-400 to-orange-400"
                    />
                    <ScoreCard 
                      label="Solution Design" 
                      score={evaluation.solutionScore}
                      icon={<Lightbulb className="h-4 w-4" />}
                      color="from-yellow-400 to-amber-400"
                    />
                    <ScoreCard 
                      label="Business Model" 
                      score={evaluation.businessModelScore}
                      icon={<Briefcase className="h-4 w-4" />}
                      color="from-blue-400 to-cyan-400"
                    />
                    <ScoreCard 
                      label="Pitch Quality" 
                      score={evaluation.pitchScore}
                      icon={<Presentation className="h-4 w-4" />}
                      color="from-purple-400 to-pink-400"
                    />
                    <ScoreCard 
                      label="Innovation" 
                      score={evaluation.innovationScore}
                      icon={<Sparkles className="h-4 w-4" />}
                      color="from-emerald-400 to-green-400"
                    />
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-amber-400/15 to-orange-400/15 px-6 py-4 ring-1 ring-amber-300/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-300" />
                        <span className="text-base font-semibold text-amber-200">Total Score</span>
                      </div>
                      <span className="text-3xl font-bold text-amber-100">{evaluation.totalScore}/50</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Feedback */}
              {evaluation.adminComments && (
                <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
                  <div className="rounded-[22px] bg-slate-950/40 p-6 ring-1 ring-white/10">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
                        <MessageSquare className="h-5 w-5 text-cyan-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white/90">Admin Feedback</h3>
                        <p className="text-xs text-white/55 mt-0.5">Suggestions to help your team grow</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {evaluation.adminComments}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluated Info */}
              <div className="text-center text-xs text-white/50">
                Evaluated by {evaluation.evaluatedBy} on{' '}
                {new Date(evaluation.evaluatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, icon, color }) {
  const percentage = (score / 10) * 100;
  
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${color} bg-opacity-20 text-white`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-white/75 flex-1">{label}</span>
        <span className="text-xl font-bold text-white/90">{score}<span className="text-sm text-white/50">/10</span></span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}
