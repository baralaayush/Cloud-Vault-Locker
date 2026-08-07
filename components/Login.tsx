
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Lock, 
  LogIn, 
  ShieldCheck, 
  Mail, 
  User,
  UserPlus, 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Link2,
  FileText,
  StickyNote,
  Sparkles
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const cleanName = fullName.trim();
        if (!cleanName) {
          throw new Error('Please enter your full name.');
        }

        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.endsWith('@gmail.com')) {
          throw new Error('Only email addresses with @gmail.com extension are allowed to create an account.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: cleanName,
              display_name: cleanName,
            }
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMessage(
            `Account created successfully! A confirmation link has been sent to ${email}. Please verify your email before logging in.`
          );
        } else {
          setSuccessMessage('Account created and verified! Redirecting...');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;

        setSuccessMessage(
          `Password recovery email sent! Check your inbox at ${email} for reset instructions.`
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans text-slate-800">
      {/* Wide Container Card */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Column: About Locker (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/90 via-slate-50 to-indigo-100/60 p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="https://aayushbaralsite.wordpress.com/wp-content/uploads/2026/08/locker-app-title-logo.png" 
                alt="Locker Logo" 
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="inline-flex flex-col items-stretch w-fit">
                <h1 className="text-4xl sm:text-[42px] font-black tracking-tight leading-none whitespace-nowrap bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Locker
                </h1>
                <div className="mt-2 w-full">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/90 py-1 px-2.5 rounded-md text-center block w-full shadow-2xs whitespace-nowrap">
                    Cloud Vault Locker
                  </span>
                </div>
              </div>
            </div>

            {/* About App Description */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="black" />
                    <circle cx="12" cy="7" r="1.3" fill="white" />
                    <path d="M12 10.5v6.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                  About Locker
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  A personal, secure cloud vault locker designed to organize your daily links, documents, and quick memos in one unified dashboard.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-sm">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Quick Links</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Bookmark and categorize your essential web portals and bookmarks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-sm">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Document Vault</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Store, search, and manage your important personal documents.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-sm">
                  <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <StickyNote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Smart Memos</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Keep persistent notes, code snippets, and daily ideas synchronized.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Authentication Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 md:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Reset Password'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {mode === 'login' && 'Enter your credentials to login.'}
                  {mode === 'signup' && 'Sign up for a new account.'}
                  {mode === 'forgot' && 'Send a password recovery link to your email'}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              {mode !== 'forgot' && (
                <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`px-5 py-2 text-sm transition-all ${
                      mode === 'login'
                        ? 'bg-blue-600 text-white font-bold rounded-xl shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className={`px-5 py-2 text-sm transition-all ${
                      mode === 'signup'
                        ? 'bg-blue-600 text-white font-bold rounded-xl shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Form Alerts */}
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-200/80">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <div>{error}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 flex items-start gap-3 bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-sm border border-emerald-200/80">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-5">
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-base font-normal"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-base font-normal"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-base font-normal"
                      placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 active:scale-[0.99] text-sm mt-2"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Send Password Recovery Email
                  </>
                )}
              </button>

              {/* Back Link for Forgot Mode */}
              {mode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to Sign In
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;


