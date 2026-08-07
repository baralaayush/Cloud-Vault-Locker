import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Link as LinkIcon, FileText, StickyNote, RefreshCw } from 'lucide-react';
import { SharedItem, getPendingNotifications, acceptSharedItem, rejectSharedItem } from '../lib/profileService';

interface NotificationsModalProps {
  userId: string;
  onItemAccepted?: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ userId, onItemAccepted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const items = await getPendingNotifications(userId);
      setNotifications(items);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (isRefreshing || loading) return;
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      const items = await getPendingNotifications(userId);
      setNotifications(items);
    } catch (err) {
      console.error('Error manual refreshing:', err);
    } finally {
      const elapsed = Date.now() - startTime;
      const minSpinMs = 350;
      setTimeout(() => {
        setIsRefreshing(false);
      }, Math.max(0, minSpinMs - elapsed));
    }
  };

  // Fetch only on initial load / login (NO auto-polling interval)
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAccept = async (item: SharedItem) => {
    setActionLoadingId(item.id);
    const result = await acceptSharedItem(item, userId);
    setActionLoadingId(null);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      if (onItemAccepted) onItemAccepted();
    } else {
      alert('Failed to accept item: ' + (result.error || 'Unknown error'));
    }
  };

  const handleReject = async (itemId: string) => {
    setActionLoadingId(itemId);
    await rejectSharedItem(itemId);
    setActionLoadingId(null);
    setNotifications(prev => prev.filter(n => n.id !== itemId));
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'link': return <LinkIcon className="w-4 h-4 text-blue-600" />;
      case 'doc': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'memo': return <StickyNote className="w-4 h-4 text-amber-600" />;
      default: return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getItemTitle = (item: SharedItem) => {
    const data = item.item_data;
    if (item.item_type === 'link') return data.title || data.url;
    if (item.item_type === 'doc') return data.name;
    if (item.item_type === 'memo') return data.title;
    return 'Shared Item';
  };

  const getItemSubtitle = (item: SharedItem) => {
    const data = item.item_data;
    if (item.item_type === 'link') return data.url;
    if (item.item_type === 'doc') return `${(data.size / 1024).toFixed(1)} KB`;
    if (item.item_type === 'memo') return data.content ? `${data.content.substring(0, 50)}...` : '';
    return '';
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="fixed left-1/2 -translate-x-1/2 top-16 w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-2 lg:translate-x-0 lg:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleManualRefresh} 
                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200/60 transition-colors disabled:opacity-50"
                title="Refresh notifications"
                disabled={isRefreshing || loading}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-slate-600 font-semibold text-sm">No new notifications</p>
                <p className="text-slate-400 text-xs mt-0.5">Shared links, docs, or memos will appear here</p>
              </div>
            ) : (
              notifications.map((item) => {
                const isLoadingThis = actionLoadingId === item.id;
                return (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                          {getItemIcon(item.item_type)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 capitalize">
                            Shared {item.item_type}
                          </p>
                          <p className="text-2xs text-slate-500">
                            From: <span className="font-semibold text-slate-700">{item.sender_name || item.sender_email}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                      <p className="font-semibold text-slate-900 truncate">{getItemTitle(item)}</p>
                      {getItemSubtitle(item) && (
                        <p className="text-slate-500 truncate text-[11px] mt-0.5">{getItemSubtitle(item)}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={isLoadingThis}
                        className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <button
                        onClick={() => handleAccept(item)}
                        disabled={isLoadingThis}
                        className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsModal;
