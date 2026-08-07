
import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { 
  Link as LinkIcon, 
  FileText, 
  StickyNote, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import Links from './Links';
import Docs from './Docs';
import Memos from './Memos';
import SettingsPanel from './Settings';
import NotificationsModal from './NotificationsModal';
import { UserProfile, getUserProfile } from '../lib/profileService';

type Section = 'links' | 'docs' | 'memo' | 'settings';

interface DashboardProps {
  user: User;
  isRecoveryMode?: boolean;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, isRecoveryMode = false, onLogout }) => {
  const [activeSection, setActiveSection] = useState<Section>(
    isRecoveryMode ? 'settings' : 'links'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProfile = async () => {
    if (user) {
      const prof = await getUserProfile(user);
      setUserProfile(prof);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (isRecoveryMode) {
      setActiveSection('settings');
    }
  }, [isRecoveryMode]);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
    }
  };

  const navItems = [
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'memo', label: 'Memo', icon: StickyNote },
  ];

  const userMode = userProfile?.mode || 'user';

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    const metaName = user.user_metadata?.full_name || user.user_metadata?.display_name;
    if (metaName && metaName.trim()) return metaName.trim();
    if (!user.email) return 'User';
    
    const prefix = user.email.split('@')[0];
    return prefix
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const userName = getDisplayName();
  const userInitial = userName.charAt(0).toUpperCase();

  const renderContent = () => {
    switch (activeSection) {
      case 'links': 
        return <Links key={refreshKey} userMode={userMode} currentUser={user} currentUserName={userName} />;
      case 'docs': 
        return <Docs key={refreshKey} userMode={userMode} currentUser={user} currentUserName={userName} />;
      case 'memo': 
        return <Memos key={refreshKey} userMode={userMode} currentUser={user} currentUserName={userName} />;
      case 'settings': 
        return <SettingsPanel user={user} userProfile={userProfile} isRecoveryMode={isRecoveryMode} onProfileUpdated={fetchProfile} />;
      default: 
        return <Links key={refreshKey} userMode={userMode} currentUser={user} currentUserName={userName} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/90 shadow-sm z-20">
        <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Locker Logo" 
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-indigo-200 shrink-0 border border-slate-200/60" 
            />
            <h1 className="font-extrabold text-2xl tracking-tight text-slate-900">Locker</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-3.5 py-5 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as Section)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                activeSection === item.id 
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200/60' 
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-base font-semibold">{item.label}</span>
              </div>
              {activeSection === item.id && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>
          ))}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-3.5 border-t border-slate-100 space-y-1 bg-slate-50/60">
          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-left ${
              activeSection === 'settings' 
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200/60' 
                : 'text-slate-600 hover:bg-white hover:text-slate-900 font-medium'
            }`}
          >
            <Settings className={`w-5 h-5 shrink-0 ${activeSection === 'settings' ? 'text-white' : 'text-slate-500'}`} />
            <span className="text-base font-semibold">Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all text-base font-semibold"
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav Top */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.jpg" 
            alt="Locker Logo" 
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-xl object-cover shadow-sm shrink-0 border border-slate-200/60" 
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-slate-900 block leading-none">Locker</span>
              {userMode === 'pro' && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  PRO
                </span>
              )}
            </div>
            <span className="text-2xs font-semibold text-slate-500 block mt-0.5 truncate max-w-[140px]">{userName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Button Mobile */}
          <NotificationsModal userId={user.id} onItemAccepted={triggerRefresh} />

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6 flex flex-col justify-between pb-8">
          <div className="space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-base font-semibold ${
                  activeSection === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveSection('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-base font-semibold ${
                  activeSection === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl text-red-600 bg-red-50 font-bold text-base"
          >
            <LogOut className="w-5 h-5" />
            Logout Account
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-16 md:pt-0 overflow-hidden">
        {/* Top Header Bar - Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-2.5 bg-white border-b border-slate-200/80 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold capitalize text-slate-900 tracking-tight">
              {activeSection === 'memo' ? 'Memos' : activeSection}
            </h2>
          </div>

          {/* Right Header Actions: Notification Bell + User Profile Info */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Button */}
            <NotificationsModal userId={user.id} onItemAccepted={triggerRefresh} />

            {/* User Profile Info in Top Header */}
            <div className="flex items-center gap-3 bg-slate-50/90 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-100/70 transition-colors">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-sm font-bold text-slate-900 block leading-snug">{userName}</span>
                  {userMode === 'pro' && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                      PRO
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 block leading-tight">{user.email}</span>
              </div>
              <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shadow-indigo-200 shrink-0">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 ${activeSection === 'memo' ? 'overflow-hidden p-4 sm:p-6 flex flex-col min-h-0' : 'overflow-y-auto p-4 sm:p-6 md:p-8'}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const ShieldCheck: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default Dashboard;
