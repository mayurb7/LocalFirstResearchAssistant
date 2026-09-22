import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  NotebookPen, 
  Bot, 
  Upload, 
  FileText, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye,
  FileCode,
  Copy,
  Check,
  Sparkles,
  Send,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';

const API_BASE = window.location.port === '5173' ? '/api' : 'http://localhost:8080/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [activeAnalysisDocId, setActiveAnalysisDocId] = useState(null);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await axios.get(`${API_BASE}/documents/user/1`);
      const docs = Array.isArray(res.data) ? res.data : [];
      setDocuments(docs);
      if (!activeAnalysisDocId && docs.length > 0) {
        setActiveAnalysisDocId(docs[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleStartAnalysis = (docId) => {
    setActiveAnalysisDocId(docId);
    setActiveTab('ai');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Research AI
            </span>
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Library className="w-5 h-5" />} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
          <NavItem icon={<NotebookPen className="w-5 h-5" />} label="Notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
          <NavItem icon={<Bot className="w-5 h-5" />} label="AI Analysis" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} />
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView 
            documents={documents} 
            onOpenLibrary={() => setActiveTab('library')} 
            onOpenAnalysis={() => setActiveTab('ai')} 
          />
        )}
        {activeTab === 'library' && (
          <LibraryView 
            documents={documents} 
            setDocuments={setDocuments} 
            refreshDocs={fetchDocuments} 
            loadingDocs={loadingDocs} 
            onAnalyze={handleStartAnalysis}
          />
        )}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'ai' && (
          <AiAnalysisView 
            documents={documents} 
            initialDocId={activeAnalysisDocId}
            onOpenLibrary={() => setActiveTab('library')}
          />
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        active 
          ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function DashboardView({ documents, onOpenLibrary, onOpenAnalysis }) {
  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome back!</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div 
          onClick={onOpenLibrary}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Total Documents</h3>
            <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold mt-2 text-indigo-600">{documents.length}</p>
        </div>
        <div 
          onClick={onOpenAnalysis}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">AI Analysis Model</h3>
            <span className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xl font-bold mt-2 text-violet-600">Gemini 3.8 Flash</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 font-medium">Recent Notes</h3>
            <span className="p-2 bg-gray-50 rounded-lg text-gray-500">
              <NotebookPen className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-bold mt-2 text-gray-700">0</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-8 text-white shadow-md flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Side-by-Side Research Studio</h3>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Inspect your original PDF documents and ask questions to Gemini 3.8 Flash in parallel with live document text extraction and prompt engineering.
          </p>
        </div>
        <button 
          onClick={onOpenAnalysis}
          className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-sm shrink-0"
        >
          Open Analysis
        </button>
      </div>
    </div>
  );
}

function LibraryView({ documents, setDocuments, refreshDocs, loadingDocs, onAnalyze }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusBanner, setStatusBanner] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setStatusBanner({ type: 'error', message: 'Please select a valid PDF file.' });
      return;
    }
    setFile(selectedFile);
    setStatusBanner(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatusBanner(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', '1');

    try {
      const res = await axios.post(`${API_BASE}/documents/upload`, formData);
      const newDoc = res.data;
      
      setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
      setStatusBanner({ 
        type: 'success', 
        message: `"${file.name}" uploaded successfully!` 
      });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refreshDocs();
    } catch (error) {
      console.error('Upload failed', error);
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.response?.data || 
                       error.message || 
                       'Upload failed. Please check backend connection.';
      setStatusBanner({ 
        type: 'error', 
        message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, docTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${docTitle}"?`)) return;

    setDeletingId(docId);
    try {
      await axios.delete(`${API_BASE}/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setStatusBanner({ type: 'success', message: `Deleted "${docTitle}".` });
    } catch (err) {
      console.error('Failed to delete document', err);
      setStatusBanner({ type: 'error', message: 'Failed to delete document.' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Library</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage research documents</p>
        </div>
        <button 
          onClick={refreshDocs}
          disabled={loadingDocs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          title="Refresh library"
        >
          <RefreshCw className={`w-4 h-4 ${loadingDocs ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh
        </button>
      </div>

      {statusBanner && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border transition-all animate-fadeIn ${
          statusBanner.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {statusBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{statusBanner.message}</span>
          <button 
            onClick={() => setStatusBanner(null)}
            className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Upload Box */}
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`bg-white rounded-2xl border-2 p-8 text-center transition-all cursor-pointer mb-8 relative ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".pdf" 
          onChange={e => handleFileSelect(e.target.files[0])} 
          className="hidden" 
        />
        
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          {file ? file.name : 'Upload new document'}
        </h3>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          {file 
            ? `Size: ${formatFileSize(file.size)} • Click below to upload` 
            : 'Drag & drop a PDF here, or click to browse (up to 50MB)'}
        </p>

        <div className="flex justify-center items-center gap-3" onClick={e => e.stopPropagation()}>
          {file ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm hover:shadow flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </button>
              <button 
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium hover:bg-indigo-100 transition-colors text-sm"
            >
              Browse Files
            </button>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>Recent Uploads</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {documents.length}
            </span>
          </h3>
        </div>

        {documents.length === 0 ? (
          <div className="text-gray-400 text-sm flex items-center justify-center flex-1 border-2 border-dashed border-gray-100 rounded-xl p-8 flex-col gap-2">
            <FileText className="w-8 h-8 text-gray-300" />
            <p>No documents uploaded yet.</p>
            <p className="text-xs text-gray-400">Upload a PDF above to get started with research analysis.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-1">
            <ul className="space-y-3">
              {documents.map(doc => (
                <li 
                  key={doc.id} 
                  className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50/80 transition-all flex justify-between items-center group shadow-none hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 overflow-hidden mr-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-gray-900 truncate" title={doc.title}>
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Uploaded {formatDate(doc.uploadTimestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onAnalyze(doc.id)}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors"
                      title="Analyze document side-by-side"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      Analyze
                    </button>
                    <button 
                      onClick={(e) => handleDelete(doc.id, doc.title, e)}
                      disabled={deletingId === doc.id}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function NotesView() {
  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Notes</h2>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 p-6 flex flex-col hover:shadow-md transition-shadow">
        <input type="text" placeholder="Note Title..." className="text-xl font-bold mb-4 outline-none placeholder-gray-300" />
        <textarea className="flex-1 w-full resize-none outline-none text-gray-700 leading-relaxed placeholder-gray-300" placeholder="Start typing your notes here..." />
      </div>
    </div>
  );
}

function AiAnalysisView({ documents, initialDocId, onOpenLibrary }) {
  const [selectedDocId, setSelectedDocId] = useState(initialDocId || (documents[0] ? documents[0].id : null));
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'text'
  const [extractedText, setExtractedText] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Chat conversation state
  const [query, setQuery] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Research Assistant running with **Gemini 3.8 Flash**.\n\nYou can read the document on the left and ask questions, generate summaries, or probe methodologies on the right.',
      timestamp: new Date()
    }
  ]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const chatEndRef = useRef(null);

  // Keep selectedDocId synchronized with incoming documents or prop
  useEffect(() => {
    if (!selectedDocId && documents.length > 0) {
      setSelectedDocId(documents[0].id);
    } else if (initialDocId) {
      setSelectedDocId(initialDocId);
    }
  }, [initialDocId, documents]);

  // Load extracted text when in text view mode
  useEffect(() => {
    if (!selectedDocId) return;

    if (viewMode === 'text') {
      setLoadingText(true);
      axios.get(`${API_BASE}/documents/${selectedDocId}/text`)
        .then(res => {
          setExtractedText(res.data.text || 'No text extracted from this document.');
        })
        .catch(err => {
          console.error('Failed to get document text', err);
          setExtractedText('Could not load text for this document.');
        })
        .finally(() => {
          setLoadingText(false);
        });
    }
  }, [selectedDocId, viewMode]);

  // Auto scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingAi]);

  const activeDoc = documents.find(d => d.id === selectedDocId);

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleAsk = async (promptToSend) => {
    const textQuery = promptToSend || query;
    if (!textQuery || !textQuery.trim()) return;

    if (!selectedDocId) {
      alert('Please select a document first.');
      return;
    }

    const userMessage = {
      id: String(Date.now()),
      role: 'user',
      content: textQuery,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoadingAi(true);

    try {
      const res = await axios.post(`${API_BASE}/ai/analyze`, {
        documentIds: [selectedDocId],
        query: textQuery
      });

      const aiResponseContent = res.data.response || (typeof res.data === 'string' ? res.data : JSON.stringify(res.data));

      const aiMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: aiResponseContent,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Analysis error', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      const errorMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `⚠️ **Error generating response**: ${errorMsg}`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoadingAi(false);
    }
  };

  const quickPrompts = [
    { label: '✨ Summarize Document', prompt: 'Provide a comprehensive summary of this document, highlighting the core objectives, methodology, and key findings.' },
    { label: '🔍 Key Findings & Takeaways', prompt: 'Extract the top 5 key findings, critical insights, and takeaways from this document in clear bullet points.' },
    { label: '📊 Analyze Methodology', prompt: 'Analyze the research methodology, experiments, data sources, and evaluation framework used in this document.' },
    { label: '❓ Critical Questions & Gaps', prompt: 'What are the main limitations, unanswered questions, or potential flaws discussed in or relevant to this document?' }
  ];

  if (documents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Documents Available</h3>
        <p className="text-gray-500 text-sm max-w-md mb-6">
          Upload a research paper or PDF in your library to start side-by-side analysis with Gemini 3.8 Flash.
        </p>
        <button
          onClick={onOpenLibrary}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Go to Document Library
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-gray-100">
      {/* LEFT PANEL: Document Viewer */}
      <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white shadow-sm z-0">
        {/* Document Header & Controls */}
        <div className="p-3.5 px-4 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shrink-0">
          {/* Document Picker Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-0">
              <select
                value={selectedDocId || ''}
                onChange={e => setSelectedDocId(Number(e.target.value))}
                className="w-full appearance-none bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium py-2 pl-3 pr-8 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate transition-colors"
              >
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    📄 {doc.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {activeDoc && (
              <a 
                href={`${API_BASE}/documents/${activeDoc.id}/file`} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                title="Open PDF in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* View Mode Toggle: PDF vs Text */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/80 shrink-0">
            <button
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'pdf'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              PDF View
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'text'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Extracted Text
            </button>
          </div>
        </div>

        {/* Viewer Content Area */}
        <div className="flex-1 bg-gray-100 p-3 overflow-hidden flex flex-col">
          {viewMode === 'pdf' ? (
            activeDoc ? (
              <iframe
                key={activeDoc.id}
                src={`${API_BASE}/documents/${activeDoc.id}/file#toolbar=1&navpanes=0`}
                className="w-full h-full rounded-xl border border-gray-300/80 shadow-sm bg-white"
                title={activeDoc.title}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a document to preview
              </div>
            )
          ) : (
            /* Extracted Text View */
            <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-3 px-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Raw Parsed Text
                </span>
                <button
                  onClick={() => handleCopyText(extractedText)}
                  disabled={!extractedText || loadingText}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto text-sm text-gray-800 leading-relaxed font-mono whitespace-pre-wrap selection:bg-indigo-100">
                {loadingText ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span>Extracting text from PDF...</span>
                  </div>
                ) : (
                  extractedText || 'No text extracted.'
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: AI Research & Prompt Assistant */}
      <div className="w-1/2 h-full flex flex-col bg-white">
        {/* Right Panel Header */}
        <div className="p-3.5 px-6 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">AI Research Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold tracking-wide uppercase border border-violet-100">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate max-w-sm">
                Context: {activeDoc ? activeDoc.title : 'No document selected'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setChatHistory([
              {
                id: 'welcome',
                role: 'assistant',
                content: 'Chat cleared. Ask me anything about the document on the left!',
                timestamp: new Date()
              }
            ])}
            className="text-xs text-gray-400 hover:text-gray-600 px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            Clear chat
          </button>
        </div>

        {/* Conversation History Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/40">
          {chatHistory.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm relative group ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap selection:bg-indigo-200 font-sans">
                  {msg.content}
                </div>

                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Gemini 3.8 Flash</span>
                    <button
                      onClick={() => handleCopyText(msg.content, msg.id)}
                      className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
                      title="Copy response"
                    >
                      {copiedMessageId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loadingAi && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-600 font-medium animate-pulse">
                  Gemini 3.8 Flash is analyzing the document...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Suggestions */}
        <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-500" /> Suggestions:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              disabled={loadingAi}
              onClick={() => handleAsk(qp.prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 font-medium transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Prompt Input Box */}
        <div className="p-4 px-6 bg-white border-t border-gray-200 shadow-sm shrink-0">
          <div className="flex items-center gap-3 bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 border border-gray-200 rounded-2xl p-2 px-4 transition-all shadow-inner">
            <textarea
              rows="1"
              className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed max-h-32 py-1"
              placeholder={`Ask Gemini 3.8 Flash about "${activeDoc ? activeDoc.title : 'this document'}"... (Enter to send)`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
            <button
              onClick={() => handleAsk()}
              disabled={loadingAi || !query.trim() || !selectedDocId}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
              title="Send prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-1.5 text-[11px] text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-gray-500 font-mono text-[10px]">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-gray-500 font-mono text-[10px]">Shift + Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
}
