
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Shield, Key, AlertCircle, CheckCircle2, Lock, User as UserIcon, Save, Sparkles } from 'lucide-react';
import { UserProfile, updateProfileName } from '../lib/profileService';

interface SettingsProps {
  user: User;
  userProfile?: UserProfile | null;
  isRecoveryMode?: boolean;
  onPasswordResetComplete?: () => void;
  onProfileUpdated?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  userProfile, 
  isRecoveryMode = false,
  onPasswordResetComplete,
  onProfileUpdated 
}) => {
  // Profile state
  const initialName = userProfile?.name || user.user_metadata?.full_name || user.user_metadata?.display_name || '';
  const [fullName, setFullName] = useState(initialName);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (userProfile?.name) {
      setFullName(userProfile.name);
    } else if (user.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user, userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    if (!cleanName) {
      setNameStatus({ type: 'error', message: 'Name cannot be empty' });
      return;
    }

    setNameLoading(true);
    setNameStatus(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          display_name: cleanName,
        },
      });

      if (error) throw error;

      // Update profiles table
      await updateProfileName(user.id, cleanName);
      if (onProfileUpdated) onProfileUpdated();

      setNameStatus({ type: 'success', message: 'Profile name updated successfully!' });
    } catch (err: any) {
      setNameStatus({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user.email) return;
    if (newPassword !== confirmPassword) {
      setPassStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setPassLoading(true);
    setPassStatus(null);

    try {
      // Only verify old password if NOT in recovery mode
      if (!isRecoveryMode) {
        if (!oldPassword) {
          throw new Error("Old password is required");
        }
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

        if (authError) {
          throw new Error("Old password is incorrect.");
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (updateError) throw updateError;

      setPassStatus({ 
        type: 'success', 
        message: isRecoveryMode 
          ? 'Password updated successfully! Recovery mode exited.' 
          : 'Password updated successfully.' 
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (isRecoveryMode && onPasswordResetComplete) {
        onPasswordResetComplete();
      }
    } catch (err: any) {
      setPassStatus({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isRecoveryMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 flex items-center gap-3 text-sm font-medium shadow-sm">
          <Key className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>Password Reset Mode:</strong> Please set a new password for <strong>{user.email}</strong> below.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
                  {userProfile?.mode === 'pro' && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Manage your personal display name and email</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {nameStatus && (
                <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                  nameStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {nameStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className="text-xs font-medium">{nameStatus.message}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm cursor-not-allowed"
                />
                <p className="text-2xs text-slate-400">Primary authentication email</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={nameLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-red-200/50 transition-all disabled:opacity-50 active:scale-95"
              >
                <Save className="w-4 h-4" />
                {nameLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col h-full">
          <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isRecoveryMode ? 'Reset Your Password' : 'Security & Password'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRecoveryMode 
                    ? `Create a new secure password for ${user.email}.`
                    : `Update your access password for account protection.`}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {passStatus && (
                <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                  passStatus.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {passStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className="text-xs font-medium">{passStatus.message}</span>
                </div>
              )}

              {!isRecoveryMode && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Old Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required={!isRecoveryMode}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                      placeholder="Verify current password"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                      placeholder="At least 6 chars"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-red-200/50 transition-all disabled:opacity-50 active:scale-95"
              >
                <Key className="w-4 h-4" />
                {passLoading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;

