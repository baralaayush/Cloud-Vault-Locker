
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InstallPwa from './components/InstallPwa';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if URL contains recovery parameters
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

    if (isRecovery) {
      setIsRecoveryMode(true);
    }

    const checkSession = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

        if (!isRecovery) {
          // Clear any stored local token artifacts & session storage on refresh
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (err) {
            // ignore local signout errors
          }
          setUser(null);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user ?? null);

          if (window.location.hash || window.location.search) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } catch (err) {
        console.error('Session initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setUser(session?.user ?? null);
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
        }
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        // Do not automatically bounce active users out on background token expiration
        // Logout occurs strictly on page refresh or explicit Logout button click.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsRecoveryMode(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore signout network errors
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user ? (
        <Dashboard user={user} isRecoveryMode={isRecoveryMode} onLogout={handleLogout} />
      ) : (
        <Login />
      )}
      <InstallPwa />
    </div>
  );
};

export default App;
