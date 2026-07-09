import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export const NotesEditor: React.FC = () => {
  const { 
    workspaceDocs, 
    addWorkspaceDoc, 
    updateWorkspaceDoc, 
    deleteWorkspaceDoc,
    renameWorkspaceDoc,
    ensureProjectDocs 
  } = useProjectStore();

  useEffect(() => {
    ensureProjectDocs('global');
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const filteredDocs = workspaceDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const activeDoc = 
    filteredDocs.find((d) => d.id === selectedNoteId) || 
    filteredDocs[0] || 
    null;

  useEffect(() => {
    if (activeDoc && activeDoc.id !== selectedNoteId) {
      setSelectedNoteId(activeDoc.id);
    }
  }, [activeDoc?.id]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  useEffect(() => {
    if (activeDoc) {
      setTitle(activeDoc.title);
      setContent(activeDoc.content);
      setSaveStatus('saved');
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeDoc?.id]);

  useEffect(() => {
    if (!activeDoc) return;
    if (title === activeDoc.title && content === activeDoc.content) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      if (title.trim() && title !== activeDoc.title) {
        renameWorkspaceDoc(activeDoc.id, title);
      }
      updateWorkspaceDoc(activeDoc.id, { title: title || 'Adsız Not', content });
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleCreateNewNote = async () => {
    await addWorkspaceDoc({
      title: 'Yeni Not',
      content: '',
    });
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteWorkspaceDoc(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-sm select-none">
      {/* Left Pane: Notes List (Apple Notes Sidebar style) */}
      <div className="w-72 flex flex-col border-r border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#161618]/50">
        <div className="p-4 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Not Defteri ({workspaceDocs.length})</span>
          </h2>
          <button
            onClick={handleCreateNewNote}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
            title="Yeni Not Ekle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Notlarda ara..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === activeDoc?.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedNoteId(doc.id)}
                className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-start justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-[#202023] shadow-sm border border-neutral-200/80 dark:border-neutral-700/80'
                    : 'hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {doc.title || 'Adsız Not'}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {doc.content.replace(/\n/g, ' ') || 'Boş not...'}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDeleteNote(doc.id, e)}
                  className="p-1 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-400">
              Not bulunamadı.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Apple Note Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1C1C1E] min-w-0">
        {activeDoc ? (
          <>
            {/* Note Editor Header */}
            <div className="px-6 py-4 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Not başlığı..."
                className="text-base font-bold bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none flex-1 truncate pr-4"
              />

              <div className="flex items-center space-x-2 text-xs text-neutral-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{saveStatus === 'saving' ? 'Kaydediliyor...' : 'Kaydedildi'}</span>
              </div>
            </div>

            {/* Note Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Notlarınızı buraya yazın..."
                className="w-full h-full bg-transparent text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 p-8 text-center">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Lütfen soldan bir not seçin veya yeni not ekleyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};
