
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Search, 
  Edit3,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';
import ShareModal from './ShareModal';

interface Memo {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface MemosProps {
  userMode?: 'user' | 'pro';
  currentUser?: User;
  currentUserName?: string;
}

const Memos: React.FC<MemosProps> = ({ userMode = 'user', currentUser, currentUserName = '' }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [shareMemoTarget, setShareMemoTarget] = useState<Memo | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchMemos = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    if (memos.length === 0) {
      setLoading(true);
    }
    try {
      const fetchPromise = supabase
        .from('memos')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 5000)
      );

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (!error && data) {
        setMemos(data);
      } else if (error) {
        console.error("Error fetching memos:", error);
      }
    } catch (err) {
      console.error("Error fetching memos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [currentUser?.id]);

  const handleSave = async () => {
    if (!title.trim() || !currentUser) {
      alert("Please enter a title");
      return;
    }
    
    if (selectedMemo && !isAdding) {
      const { error } = await supabase.from('memos').update({ title, content }).match({ id: selectedMemo.id });
      if (!error) {
        fetchMemos();
        // Update local state to reflect changes if currently viewing
        setSelectedMemo(prev => prev ? { ...prev, title, content } : null);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        alert("Update failed: " + error.message);
      }
    } else {
      const { data, error } = await supabase.from('memos').insert([{ user_id: currentUser.id, title, content }]).select().single();
      if (!error) {
        setIsAdding(false);
        if (data) {
          setSelectedMemo(data);
        } else {
          setTitle('');
          setContent('');
        }
        fetchMemos();
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        alert("Insert failed: " + error.message);
      }
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete memo?')) return;
    const { error } = await supabase.from('memos').delete().match({ id });
    if (!error) {
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
        setTitle('');
        setContent('');
      }
      fetchMemos();
    }
  };

  const filteredMemos = memos.filter(m => {
    const memoTitle = (m.title || '').toLowerCase();
    const memoContent = (m.content || '').toLowerCase();
    const query = (search || '').toLowerCase();
    return memoTitle.includes(query) || memoContent.includes(query);
  });

  const isEditing = !!(selectedMemo || isAdding);

  const originalTitle = isAdding ? '' : (selectedMemo?.title || '');
  const originalContent = isAdding ? '' : (selectedMemo?.content || '');
  const hasChanges = (title !== originalTitle) || (content !== originalContent);

  return (
    <div className="w-full max-w-6xl mx-auto h-full flex-1 flex gap-6 overflow-hidden min-h-0">
      {/* Sidebar List - Hidden on mobile if editing */}
      <div className={`w-full md:w-80 flex flex-col gap-3.5 h-full overflow-hidden ${isEditing ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-2 shrink-0 p-1 -m-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              spellCheck={false}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/20 shadow-2xs transition-all"
            />
          </div>
          <button
            onClick={() => {
              setIsAdding(true);
              setSelectedMemo(null);
              setTitle('');
              setContent('');
              setSavedSuccess(false);
            }}
            className="p-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {loading ? (
             <div className="flex justify-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : filteredMemos.map((memo) => (
            <button
              key={memo.id}
              onClick={() => {
                setSelectedMemo(memo);
                setIsAdding(false);
                setTitle(memo.title || '');
                setContent(memo.content || '');
                setSavedSuccess(false);
              }}
              className={`group w-full p-4 rounded-2xl text-left border transition-all ${
                selectedMemo?.id === memo.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1 gap-1.5 min-w-0">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate flex-1 min-w-0 leading-tight" title={memo.title || 'Untitled'}>
                  {memo.title || 'Untitled'}
                </h4>
                <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
                  selectedMemo?.id === memo.id 
                    ? 'opacity-100 pointer-events-auto' 
                    : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
                }`}>
                  {userMode === 'pro' && currentUser && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareMemoTarget(memo);
                      }} 
                      className="p-1 hover:bg-indigo-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Share Memo"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div 
                    onClick={(e) => handleDelete(memo.id, e)} 
                    className="p-1 hover:bg-red-100 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                    title="Delete Memo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-2">{memo.content || 'No content'}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <Calendar className="w-3 h-3" />
                {new Date(memo.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
          {!loading && filteredMemos.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">No memos found.</div>
          )}
        </div>
      </div>

      {/* Editor Area - Visible on desktop always, or mobile if editing */}
      <div className={`flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex-col h-full ${isEditing ? 'flex' : 'hidden md:flex'}`}>
        {isEditing ? (
          <>
            <div className="px-4 md:px-5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button 
                  onClick={() => { setSelectedMemo(null); setIsAdding(false); }} 
                  className="p-1.5 text-slate-500 hover:text-slate-800 md:hidden shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-2.5 flex-1 min-w-0 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-500/20 transition-all">
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md shrink-0">
                    Title
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSavedSuccess(false);
                    }}
                    placeholder="Enter memo title..."
                    spellCheck={false}
                    className="text-base font-bold text-slate-900 outline-none w-full bg-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSave}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    savedSuccess 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : hasChanges
                        ? 'bg-slate-600 text-white hover:bg-slate-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSavedSuccess(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = e.currentTarget;
                  const isAtEnd = target.selectionStart >= target.value.length;
                  if (isAtEnd) {
                    setTimeout(() => {
                      target.scrollTop = target.scrollHeight;
                    }, 0);
                  }
                }
              }}
              onInput={(e) => {
                const target = e.currentTarget;
                if (target.selectionStart >= target.value.length) {
                  target.scrollTop = target.scrollHeight;
                }
              }}
              spellCheck={false}
              autoCorrect="off"
              placeholder="Start typing your thoughts here..."
              className="flex-1 p-4 md:p-5 outline-none text-slate-700 leading-[1.5] resize-none bg-slate-50/30 font-medium overflow-y-auto min-h-0"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Edit3 className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Select a memo or create one</h3>
            <p className="max-w-xs mt-2">Your private notes are encrypted and only accessible by you.</p>
          </div>
        )}
      </div>

      {/* Share Modal for Pro Users */}
      {shareMemoTarget && currentUser && (
        <ShareModal
          isOpen={!!shareMemoTarget}
          onClose={() => setShareMemoTarget(null)}
          currentUser={currentUser}
          currentUserName={currentUserName}
          itemType="memo"
          itemData={{ title: shareMemoTarget.title, content: shareMemoTarget.content }}
          itemTitle={shareMemoTarget.title || 'Untitled Memo'}
        />
      )}
    </div>
  );
};

export default Memos;
