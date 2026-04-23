'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Ticket, RefreshCw, Loader2, Edit3, X, Mail, Check, Rocket, ExternalLink, Award, MessageSquare, User, TrendingUp, Trophy, Medal, Crown } from 'lucide-react';

export default function TeamDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTeams: 0, totalMembers: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/startup-starter/teams');
      const data = await response.json();
      
      if (data.success) {
        setTeams(data.teams);
        setStats({
          totalTeams: data.totalTeams,
          totalMembers: data.totalMembers
        });
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    fetchTeams();
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-400 mx-auto" />
              <p className="mt-4 text-white/70">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-48 right-10 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Header */}
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
                  <Users className="h-6 w-6 text-white/80" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Team Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-white/65">
                    View your team members and manage team details
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {teams.some(t => t.resultsPublished) && (
                  <a
                    href="/startup-starter/evaluation"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400/15 to-orange-400/15 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-amber-300/25 transition hover:from-amber-400/25 hover:to-orange-400/25"
                  >
                    <Award className="h-4 w-4" />
                    View Evaluation
                  </a>
                )}
                <button
                  onClick={fetchTeams}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/8"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: 'easeOut' }}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <StatCard
            title="Total Teams"
            value={stats.totalTeams}
            icon={<Users className="h-5 w-5" />}
            accent="from-indigo-500/25 to-cyan-400/10"
          />
          <StatCard
            title="Total Participants"
            value={stats.totalMembers}
            icon={<Ticket className="h-5 w-5" />}
            accent="from-emerald-500/25 to-cyan-400/10"
          />
        </motion.div>

        {/* Leaderboard */}
        {teams.some(t => t.evaluation && t.resultsPublished) && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease: 'easeOut' }}
            className="mt-6 rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
          >
            <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 ring-1 ring-white/10">
                    <Trophy className="h-5 w-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white/90">Leaderboard</h2>
                    <p className="text-xs text-white/55">Top performing teams</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Leaderboard teams={teams} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Teams Grid */}
        {teams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease: 'easeOut' }}
            className="mt-6 rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur"
          >
            <div className="rounded-[22px] bg-slate-950/40 p-12 text-center ring-1 ring-white/10">
              <Users className="h-16 w-16 text-white/30 mx-auto" />
              <h3 className="mt-4 text-lg font-semibold text-white/80">No Teams Yet</h3>
              <p className="mt-2 text-sm text-white/55">
                Teams will appear here once the admin creates them.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {teams.map((team, index) => (
              <motion.div
                key={team.teamId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + index * 0.03, duration: 0.35, ease: 'easeOut' }}
              >
                <TeamCard team={team} onEdit={() => handleEditClick(team)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedTeam && (
          <EditTeamModal
            team={selectedTeam}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamCard({ team, onEdit }) {
  return (
    <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
      <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
        {/* Team Header */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 ring-1 ring-white/10">
                  <Users className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  {team.teamName ? (
                    <>
                      <h3 className="text-lg font-semibold text-white/90 truncate">
                        {team.teamName}
                      </h3>
                      <p className="text-xs text-white/55">
                        Team {team.teamNumber} • {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-white/90">
                        Team {team.teamNumber}
                      </h3>
                      <p className="text-xs text-white/55">
                        {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              {team.startupName && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 px-3 py-2 ring-1 ring-orange-400/20">
                  <Rocket className="h-4 w-4 text-orange-300" />
                  <span className="text-sm font-medium text-orange-200">{team.startupName}</span>
                </div>
              )}

              {/* i2r Profile Links */}
              {(team.i2rMemberProfileUrls || team.i2rIdeaProfileUrl || team.i2rCompanyProfileUrl) && (
                <div className="mt-3 space-y-2">
                  {team.i2rMemberProfileUrls && (
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-white/60">Member Profiles:</div>
                      <div className="flex flex-wrap gap-2">
                        {team.i2rMemberProfileUrls.split(',').map((url, idx) => {
                          const trimmedUrl = url.trim();
                          if (!trimmedUrl) return null;
                          return (
                            <a
                              key={idx}
                              href={trimmedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-200 ring-1 ring-cyan-300/20 transition hover:bg-cyan-400/20"
                            >
                              <User className="h-3 w-3" />
                              Member {idx + 1}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {team.i2rIdeaProfileUrl && (
                      <a
                        href={team.i2rIdeaProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-400/10 px-2.5 py-1.5 text-xs font-medium text-purple-200 ring-1 ring-purple-300/20 transition hover:bg-purple-400/20"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Idea Profile
                      </a>
                    )}
                    {team.i2rCompanyProfileUrl && (
                      <a
                        href={team.i2rCompanyProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/10 px-2.5 py-1.5 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20 transition hover:bg-emerald-400/20"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Company Profile
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onEdit}
              className="flex-shrink-0 grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/8 hover:text-white/90"
              title="Edit team details"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Team Members - Compact View */}
        <div className="p-6 space-y-3">
          {/* Evaluation Link - Only show if results are published */}
          {team.resultsPublished && (
            <a
              href="/startup-starter/evaluation"
              className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-3 ring-1 ring-amber-300/20 transition hover:from-amber-500/15 hover:to-orange-500/15"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-amber-400/20 ring-1 ring-amber-300/25">
                  <Award className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <div className="font-semibold text-amber-200 text-sm">
                    View Evaluation Results
                  </div>
                  <div className="text-xs text-amber-300/70 mt-0.5">
                    Check your Shark Tank scores and feedback
                  </div>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-amber-300 flex-shrink-0" />
            </a>
          )}

          {team.members.map((member, idx) => (
            <div
              key={member.ticketId}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/8"
            >
              <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-indigo-400/15 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-300/20">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white/90 truncate text-sm">
                  {member.name}
                </h4>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-white/55">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{member.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreItem({ label, score }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/65">{label}</span>
        <span className="text-sm font-bold text-white/90">{score}/10</span>
      </div>
    </div>
  );
}

function EditTeamModal({ team, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState(team.teamName || '');
  const [startupName, setStartupName] = useState(team.startupName || '');
  const [i2rMemberProfileUrls, setI2rMemberProfileUrls] = useState(team.i2rMemberProfileUrls || '');
  const [i2rIdeaProfileUrl, setI2rIdeaProfileUrl] = useState(team.i2rIdeaProfileUrl || '');
  const [i2rCompanyProfileUrl, setI2rCompanyProfileUrl] = useState(team.i2rCompanyProfileUrl || '');
  const [step, setStep] = useState('verify'); // verify, edit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const handleVerifyEmail = () => {
    setError('');
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email belongs to this team
    const isMember = team.members.some(m => m.email.toLowerCase() === normalizedEmail);
    
    if (!isMember) {
      setError('This email is not a member of this team');
      return;
    }

    setVerifiedEmail(normalizedEmail);
    setStep('edit');
  };

  const handleSave = async () => {
    if (!teamName.trim() && !startupName.trim()) {
      setError('Please enter at least team name or startup name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/startup-starter/teams/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifiedEmail,
          teamName: teamName.trim() || null,
          startupName: startupName.trim() || null,
          i2rMemberProfileUrls: i2rMemberProfileUrls.trim() || null,
          i2rIdeaProfileUrl: i2rIdeaProfileUrl.trim() || null,
          i2rCompanyProfileUrl: i2rCompanyProfileUrl.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to update team details');
      }
    } catch (error) {
      setError('Failed to update team details');
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-md"
      >
        <div className="rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
          <div className="rounded-[22px] bg-slate-950/40 ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <Edit3 className="h-5 w-5 text-white/80" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white/90">
                    {step === 'verify' ? 'Verify Email' : 'Edit Team Details'}
                  </h2>
                  <p className="text-xs text-white/60">
                    {step === 'verify' ? 'Enter your email to continue' : `Team ${team.teamNumber}`}
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

            <div className="p-6 space-y-4">
              {step === 'verify' ? (
                <>
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
                    <p className="text-xs text-white/50">
                      Only team members can edit team details
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleVerifyEmail}
                    disabled={!email.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(56,189,248,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Verify Email
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g., The Innovators"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">
                      Startup Name
                    </label>
                    <input
                      type="text"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      placeholder="e.g., TechVenture Solutions"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-white/80 mb-3">i2r Profile URLs</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-white/70">
                          Member Profile URLs (comma-separated)
                        </label>
                        <textarea
                          value={i2rMemberProfileUrls}
                          onChange={(e) => setI2rMemberProfileUrls(e.target.value)}
                          placeholder="https://i2r.com/profile/member1, https://i2r.com/profile/member2, ..."
                          rows={3}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8 resize-none"
                        />
                        <p className="text-xs text-white/50">
                          Enter each team member's i2r profile URL separated by commas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-white/70">
                          Idea Profile URL
                        </label>
                        <input
                          type="url"
                          value={i2rIdeaProfileUrl}
                          onChange={(e) => setI2rIdeaProfileUrl(e.target.value)}
                          placeholder="https://i2r.com/idea/..."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-white/70">
                          Company Profile URL
                        </label>
                        <input
                          type="url"
                          value={i2rCompanyProfileUrl}
                          onChange={(e) => setI2rCompanyProfileUrl(e.target.value)}
                          placeholder="https://i2r.com/company/..."
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-white/20 focus:bg-white/8"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/8"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading || (!teamName.trim() && !startupName.trim())}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-22px_rgba(16,185,129,.5)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, accent }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/6 p-1 ring-1 ring-white/15 backdrop-blur">
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
        <div className="mt-1 text-xs text-white/45">Live count</div>
      </div>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
    </div>
  );
}

function Leaderboard({ teams }) {
  // Filter and sort teams by evaluation score
  const rankedTeams = teams
    .filter(team => team.evaluation && team.resultsPublished)
    .sort((a, b) => b.evaluation.totalScore - a.evaluation.totalScore)
    .slice(0, 10); // Top 10 teams

  if (rankedTeams.length === 0) {
    return (
      <div className="text-center py-8 text-white/50 text-sm">
        No evaluation results published yet
      </div>
    );
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-300" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return null;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'from-amber-400/20 to-yellow-400/20 ring-amber-300/30 text-amber-200';
    if (rank === 2) return 'from-slate-400/20 to-gray-400/20 ring-slate-300/30 text-slate-200';
    if (rank === 3) return 'from-orange-400/20 to-amber-400/20 ring-orange-300/30 text-orange-200';
    return 'from-white/5 to-white/5 ring-white/10 text-white/70';
  };

  return (
    <div className="space-y-3">
      {rankedTeams.map((team, index) => {
        const rank = index + 1;
        const percentage = (team.evaluation.totalScore / 50) * 100;

        return (
          <motion.div
            key={team.teamId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/8"
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br ring-1 ${getRankBadge(rank)}`}>
                {getRankIcon(rank) || (
                  <span className="text-lg font-bold">{rank}</span>
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white/90 truncate">
                    {team.teamName || `Team ${team.teamNumber}`}
                  </h3>
                  {rank <= 3 && (
                    <span className="inline-flex items-center rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/25">
                      Top {rank}
                    </span>
                  )}
                </div>
                {team.startupName && (
                  <p className="text-xs text-white/55 truncate mt-0.5">{team.startupName}</p>
                )}
                
                {/* Progress Bar */}
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                  />
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-white/90">
                  {team.evaluation.totalScore}
                </div>
                <div className="text-xs text-white/50">/50</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
