import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User } from '@supabase/supabase-js';
import { X, Search, Share2, Check, User as UserIcon, Send, Sparkles } from 'lucide-react';
import { UserProfile, getAllProfiles, shareItem } from '../lib/profileService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentUserName: string;
  itemType: 'link' | 'doc' | 'memo';
  itemData: any;
  itemTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentUserName,
  itemType,
  itemData,
  itemTitle,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<Record<string, boolean>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && currentUser) {
      setLoading(true);
      setSharedUsers({});
      setSearch('');

      getAllProfiles(currentUser.id)
        .then((list) => {
          if (isMounted) setProfiles(list);
        })
        .catch((err) => {
          console.error('Error fetching profiles in ShareModal:', err);
          if (isMounted) setProfiles([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProfiles = profiles.filter(p => {
    const name = (p.name || '').toLowerCase();
    const gmail = (p.gmail || '').toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || gmail.includes(query);
  });

  const handleSendShare = async (targetProfile: UserProfile) => {
    setSendingId(targetProfile.id);
    const result = await shareItem(
      currentUser,
      currentUserName,
      targetProfile,
      itemType,
      itemData
    );
    setSendingId(null);

    if (result.success) {
      setSharedUsers(prev => ({ ...prev, [targetProfile.id]: true }));
    } else {
      alert('Failed to share: ' + (result.error || 'Unknown error'));
    }
  };

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/30 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-indigo-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">Share {itemType}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px] font-medium">{itemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Profiles List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading user directory...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-8 text-center">
              <UserIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">No users found</p>
              <p className="text-slate-400 text-xs mt-1">Users will appear here once they sign up</p>
            </div>
          ) : (
            filteredProfiles.map((userProfile) => {
              const isShared = sharedUsers[userProfile.id];
              const isSending = sendingId === userProfile.id;

              return (
                <div key={userProfile.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-2xl flex items-center justify-center shrink-0 text-sm">
                      {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm truncate">{userProfile.name}</span>
                        {userProfile.mode === 'pro' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                            PRO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{userProfile.gmail}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendShare(userProfile)}
                    disabled={isShared || isSending}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isShared
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 active:scale-95'
                    }`}
                  >
                    {isShared ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Shared
                      </>
                    ) : isSending ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-500">
            Share items instantly with Locker users
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShareModal;
