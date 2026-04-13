'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { FiArrowLeft, FiEdit2, FiLoader, FiLock, FiMail, FiPhone, FiUser, FiX } from 'react-icons/fi';

export default function InternProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Change Password
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [passwordChanging, setPasswordChanging] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    skills: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
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
        setProfileData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          department: data.user.department || '',
          skills: Array.isArray(data.user.skills) ? data.user.skills.join(', ') : '',
        });
      } else {
        router.push('/intern');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/intern');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...profileData,
          skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
        checkAuth();
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendOTP = async () => {
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setOtpSending(true);
    try {
      const response = await fetch('/api/users/send-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: passwordData.currentPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('OTP sent to your email!');
        setPasswordStep(2);
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!passwordData.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch('/api/users/verify-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          otp: passwordData.otp,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('OTP verified! Now enter your new password.');
        setPasswordStep(3);
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please enter both password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordChanging(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          otp: passwordData.otp,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordStep(1);
        setPasswordData({
          currentPassword: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setPasswordChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] py-8 px-4 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-violet-600 text-white px-6 py-5 rounded-t-2xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-cyan-100">Manage your account settings</p>
            </div>
            <Link href="/intern/dashboard">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition inline-flex items-center border border-white/20">
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            </Link>
          </div>

          <div className="p-6">
            {/* Profile Form */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-white/15 rounded-lg bg-slate-900/70 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={profileData.department}
                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="JavaScript, React, Node.js"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white px-6 py-2 rounded-lg transition inline-flex items-center"
                >
                  {updating ? <FiLoader className="animate-spin mr-2" /> : <FiEdit2 className="mr-2" />}
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg transition inline-flex items-center"
                >
                  <FiLock className="mr-2" />
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 border border-white/10 rounded-2xl max-w-md w-full">
            <div className="bg-amber-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStep(1);
                  setPasswordData({
                    currentPassword: '',
                    otp: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="text-white hover:text-slate-200 text-2xl"
              >
                <FiX />
              </button>
            </div>

            <div className="p-6">
              {/* Step 1: Enter Current Password */}
              {passwordStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Enter your current password to receive an OTP via email.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-6 py-2 rounded-lg transition"
                  >
                    {otpSending ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              )}

              {/* Step 2: Verify OTP */}
              {passwordStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Enter the 6-digit OTP sent to your email: {user?.email}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={passwordData.otp}
                      onChange={(e) => setPasswordData({ ...passwordData, otp: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength="6"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otpVerifying}
                      className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-6 py-2 rounded-lg transition"
                    >
                      {otpVerifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      onClick={() => setPasswordStep(1)}
                      className="px-4 py-2 border border-white/15 text-slate-200 rounded-lg hover:bg-slate-800"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Enter New Password */}
              {passwordStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-300">
                    Enter your new password. It must be at least 6 characters long.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/15 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={passwordChanging}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 text-white px-6 py-2 rounded-lg transition"
                  >
                    {passwordChanging ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
