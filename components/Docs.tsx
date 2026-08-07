
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Edit2,
  Search,
  Table,
  Presentation,
  Archive,
  Music,
  Video,
  Share2,
  ClipboardPaste
} from 'lucide-react';
import ShareModal from './ShareModal';

interface DocRecord {
  id: string;
  name: string;
  storage_path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

interface DocsProps {
  userMode?: 'user' | 'pro';
  currentUser?: User;
  currentUserName?: string;
}

const BUCKET_NAME = 'personal-documents';

const Docs: React.FC<DocsProps> = ({ userMode = 'user', currentUser, currentUserName = '' }) => {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ current: number; total: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [preservedExt, setPreservedExt] = useState('');
  const [search, setSearch] = useState('');
  const [shareDocTarget, setShareDocTarget] = useState<DocRecord | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('docs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching docs:', error);
      } else if (data) {
        setDocs(data);
      }
    } catch (err) {
      console.error('Error fetching docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentUser?.id]);

  const handlePasteBox = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (uploading) return;

    const clipboardFiles: File[] = [];
    if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file) clipboardFiles.push(file);
      }
    } else if (e.clipboardData?.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) clipboardFiles.push(file);
        }
      }
    }

    if (clipboardFiles.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      handleUpload(clipboardFiles);
    }
  };


  const handleUpload = async (fileList: FileList | File[] | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const oversizedFiles = files.filter(f => f.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`The following file(s) exceed the 50MB limit:\n` + oversizedFiles.map(f => f.name).join('\n'));
    }

    const validFiles = files.filter(f => f.size <= 50 * 1024 * 1024);
    if (validFiles.length === 0) return;

    if (!currentUser) {
      alert("Please log in to upload files.");
      return;
    }

    setUploading(true);
    setUploadStatus({ current: 0, total: validFiles.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadStatus({ current: i + 1, total: validFiles.length });

      const uniquePrefix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const storagePath = `${currentUser.id}/${uniquePrefix}_${file.name}`;

      try {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file);

        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from('docs')
          .insert([{
            name: file.name,
            storage_path: storagePath,
            size: file.size,
            mime_type: file.type || 'application/octet-stream',
            user_id: currentUser.id
          }]);

        if (dbError) throw dbError;
        successCount++;
      } catch (err: any) {
        console.error(`Error uploading ${file.name}:`, err);
        failCount++;
      }
    }

    if (failCount > 0) {
      alert(`Uploaded ${successCount} file(s). ${failCount} file(s) failed.`);
    }

    fetchDocs();
    setUploading(false);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (doc: DocRecord) => {
    if (!confirm(`Permanently delete ${doc.name}?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('docs')
        .delete()
        .match({ id: doc.id });

      if (dbError) throw dbError;

      fetchDocs();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleDownload = async (doc: DocRecord) => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(doc.storage_path);
    
    if (error) {
      alert("Download failed: " + error.message);
      return;
    }
    
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleView = async (doc: DocRecord) => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.storage_path, 120);

    if (!error && data) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const startRename = (doc: DocRecord) => {
    const lastDotIndex = doc.name.lastIndexOf('.');
    if (lastDotIndex > 0) {
      setNewName(doc.name.substring(0, lastDotIndex));
      setPreservedExt(doc.name.substring(lastDotIndex));
    } else {
      setNewName(doc.name);
      setPreservedExt('');
    }
    setRenameId(doc.id);
  };

  const handleRenameSubmit = async (doc: DocRecord) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setRenameId(null);
      return;
    }

    const finalFullName = trimmedName + preservedExt;
    
    if (finalFullName === doc.name) {
      setRenameId(null);
      return;
    }

    const { error } = await supabase
      .from('docs')
      .update({ name: finalFullName })
      .match({ id: doc.id });

    if (!error) {
      setRenameId(null);
      fetchDocs();
    } else {
      alert('Rename failed: ' + error.message);
    }
  };

  const getFileIcon = (doc: DocRecord) => {
    const { mime_type, name } = doc;
    const extension = name.split('.').pop()?.toLowerCase() || '';

    // Images
    if (mime_type.startsWith('image/')) return <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />;
    
    // PDFs
    if (mime_type === 'application/pdf' || extension === 'pdf') return <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />;
    
    // Word Docs
    if (
      mime_type.includes('word') || 
      mime_type.includes('officedocument.wordprocessingml') || 
      ['doc', 'docx'].includes(extension)
    ) return <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />;
    
    // Excel / Sheets
    if (
      mime_type.includes('excel') || 
      mime_type.includes('spreadsheetml') || 
      mime_type.includes('csv') ||
      ['xls', 'xlsx', 'csv'].includes(extension)
    ) return <Table className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />;
    
    // PowerPoint / Slides
    if (
      mime_type.includes('powerpoint') || 
      mime_type.includes('presentationml') || 
      ['ppt', 'pptx'].includes(extension)
    ) return <Presentation className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />;

    // Text files
    if (mime_type.startsWith('text/') || extension === 'txt' || extension === 'log') return <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" />;

    // Compressed archives
    if (mime_type.includes('zip') || mime_type.includes('compressed') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <Archive className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />;

    // Audio
    if (mime_type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return <Music className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />;

    // Video
    if (mime_type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv'].includes(extension)) return <Video className="w-7 h-7 sm:w-8 sm:h-8 text-pink-500" />;

    // Default
    return <File className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />;
  };

  const filteredDocs = docs.filter(d => 
    (d.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-3 sm:space-y-3.5 pb-12">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl py-5 px-4 sm:py-6 sm:px-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
            : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
        }`}
      >
        <input 
          type="file" 
          multiple
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => handleUpload(e.target.files)} 
        />
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 transition-all ${
          uploading ? 'bg-indigo-100' : 'bg-slate-100'
        }`}>
          {uploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          ) : (
            <Upload className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${dragActive ? 'text-indigo-500' : 'text-slate-400'}`} />
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 text-center">
          {uploading 
            ? uploadStatus 
              ? `Uploading file ${uploadStatus.current} of ${uploadStatus.total}...`
              : 'Uploading your files...' 
            : 'Drop your files here'}
        </h3>
        <p className="text-slate-500 mt-0.5 text-xs sm:text-sm font-medium text-center">
          {uploading 
            ? 'Please wait while your documents are being saved' 
            : 'Drag & drop multiple files or click to browse (Up to 50MB per file)'}
        </p>

        {!uploading && (
          <div className="mt-2.5 sm:mt-3.5 w-full max-w-sm sm:max-w-md hidden lg:block" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center">
              <ClipboardPaste className="absolute left-3.5 w-4 h-4 text-indigo-500 pointer-events-none" />
              <input
                type="text"
                value=""
                onChange={() => {}}
                placeholder="Click here & press Ctrl+V to paste document"
                onPaste={handlePasteBox}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100 focus:bg-indigo-50/50 border border-slate-200 focus:border-indigo-400 rounded-xl outline-none text-slate-700 placeholder:text-slate-400 font-medium transition-all text-center cursor-pointer focus:cursor-text shadow-inner"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Your Documents ({filteredDocs.length})</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              onClick={() => setSelectedDocId(selectedDocId === doc.id ? null : doc.id)}
              className={`py-1.5 px-3 sm:py-1.5 sm:px-3.5 flex items-center gap-2.5 sm:gap-3 transition-all group cursor-pointer select-none ${
                selectedDocId === doc.id 
                  ? 'bg-indigo-50/80' 
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {getFileIcon(doc)}
              </div>

              <div className="flex-1 min-w-0">
                {renameId === doc.id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center flex-1 bg-slate-100 border border-indigo-300 rounded overflow-hidden max-w-sm">
                      <input
                        type="text"
                        value={newName}
                        autoFocus
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-2 py-1 outline-none w-full bg-transparent font-semibold text-slate-700 text-sm sm:text-base"
                      />
                      <span className="px-2 py-1 bg-slate-200 text-slate-500 text-xs sm:text-sm font-medium border-l border-slate-300">
                        {preservedExt}
                      </span>
                    </div>
                    <button onClick={() => handleRenameSubmit(doc)} className="text-green-500 hover:text-green-600"><CheckCircle2 className="w-5 h-5" /></button>
                    <button onClick={() => setRenameId(null)} className="text-red-500 hover:text-red-600"><XCircle className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center gap-0">
                    {/* Upper horizontal line: Full width reserved for file name */}
                    <div className="w-full min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-sm sm:text-base leading-tight" title={doc.name}>
                        {doc.name}
                      </h4>
                    </div>

                    {/* Lower horizontal line: Date & file size aligned with Function buttons */}
                    <div className="w-full flex items-center justify-between gap-2 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-400 font-medium whitespace-nowrap shrink-0 leading-tight">
                        {new Date(doc.created_at).toLocaleDateString()} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-0.5 sm:gap-1 shrink-0 transition-opacity duration-150 ${
                          selectedDocId === doc.id 
                            ? 'opacity-100 pointer-events-auto' 
                            : 'opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto'
                        }`}
                      >
                        {userMode === 'pro' && currentUser && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShareDocTarget(doc); }}
                            className="p-1 text-indigo-600 hover:bg-indigo-100/80 rounded-lg transition-colors"
                            title="Share Document"
                          >
                            <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleView(doc); }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/80 rounded-lg transition-colors"
                          title="View Temporary Link"
                        >
                          <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/80 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); startRename(doc); }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100/80 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!loading && filteredDocs.length === 0 && (
            <div className="py-24 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <File className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-lg font-medium">No documents found.</p>
              <p className="text-sm">Upload your first file to see it here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal for Pro Users */}
      {shareDocTarget && currentUser && (
        <ShareModal
          isOpen={!!shareDocTarget}
          onClose={() => setShareDocTarget(null)}
          currentUser={currentUser}
          currentUserName={currentUserName}
          itemType="doc"
          itemData={{
            name: shareDocTarget.name,
            storage_path: shareDocTarget.storage_path,
            size: shareDocTarget.size,
            mime_type: shareDocTarget.mime_type,
          }}
          itemTitle={shareDocTarget.name}
        />
      )}
    </div>
  );
};

export default Docs;
