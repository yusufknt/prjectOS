import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Search,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useProjectStore } from '../../store/projectStore';

export const NotesEditor: React.FC = () => {
  const { 
    projects, 
    selectedProjectId, 
    workspaceDocs, 
    addWorkspaceDoc, 
    updateWorkspaceDoc, 
    deleteWorkspaceDoc,
    renameWorkspaceDoc,
    ensureProjectDocs 
  } = useProjectStore();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Proje seçildiğinde notların olduğundan emin ol
  useEffect(() => {
    if (selectedProjectId) {
      ensureProjectDocs(selectedProjectId);
    }
  }, [selectedProjectId]);

  const projectDocs = selectedProjectId
    ? workspaceDocs.filter((d) => d.project_id === selectedProjectId)
    : workspaceDocs;

  // Arama filtresi
  const [searchQuery, setSearchQuery] = useState('');
  const filteredDocs = projectDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Aktif seçilen not
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  
  // Eğer seçili not listede yoksa veya ilk kez açılıyorsa ilk notu seç
  const activeDoc = 
    filteredDocs.find((d) => d.id === selectedNoteId) || 
    filteredDocs[0] || 
    null;

  useEffect(() => {
    if (activeDoc && activeDoc.id !== selectedNoteId) {
      setSelectedNoteId(activeDoc.id);
    }
  }, [activeDoc?.id]);

  // Editör Yerel Durumları (Gecikmeli kaydetmek için)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Not değiştirildiğinde yerel durumları yükle
  useEffect(() => {
    if (activeDoc) {
      setTitle(activeDoc.title);
      setContent(activeDoc.content);
      setIsSaving(false);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeDoc?.id]);

  // Otomatik Kaydetme (Autosave & Autorename) — 600ms gecikmeli
  useEffect(() => {
    if (!activeDoc) return;

    // Eğer disktekiyle aynıysa kaydetmeye çalışma
    if (title === activeDoc.title && content === activeDoc.content) {
      return;
    }

    setIsSaving(true);
    const saveTimer = setTimeout(async () => {
      // 1. Başlık değiştiyse dosya adını güncelle
      if (title !== activeDoc.title && title.trim() !== '') {
        await renameWorkspaceDoc(activeDoc.id, title);
      }
      
      // 2. İçerik ve başlığı kaydet
      await updateWorkspaceDoc(activeDoc.id, { title, content });
      setIsSaving(false);
    }, 600);

    return () => clearTimeout(saveTimer);
  }, [title, content, activeDoc?.id]);

  // Yeni Not Ekleme
  const handleCreateNote = async () => {
    if (!selectedProjectId) return;
    const newTitle = `Yeni Not (${new Date().toLocaleDateString('tr-TR')})`;
    const defaultContent = `# ${newTitle}\n\nNot detaylarını buraya girebilirsiniz.`;
    await addWorkspaceDoc({
      project_id: selectedProjectId,
      title: newTitle,
      content: defaultContent,
    });
  };

  // Not Silme
  const handleDeleteNote = async () => {
    if (!activeDoc) return;
    if (window.confirm(`"${activeDoc.title}" notunu silmek istediğinize emin misiniz?`)) {
      await deleteWorkspaceDoc(activeDoc.id);
      setSelectedNoteId(null);
    }
  };

  // Not içeriğinden kısa özet al
  const getSnippet = (text: string) => {
    // Markdown başlıklarını ve sembolleri kaldırıp düz yazı snippet al
    const cleanText = text
      .replace(/[#*`_\-]/g, '')
      .replace(/\[.*\]\(.*\)/g, '')
      .trim();
    if (cleanText.length > 60) {
      return cleanText.substring(0, 60) + '...';
    }
    return cleanText || 'Boş Not';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Geliştirici Hafızası & Notlar
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {selectedProject
              ? `"${selectedProject.name}" için Apple Notlar tarzında sadeleştirilmiş Markdown notları`
              : 'Tüm projelerinizin notları'}
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-210px)] overflow-hidden">
        {/* Left Column: Notes List (Sidebar) */}
        <div className="lg:col-span-1 flex flex-col bg-white dark:bg-[#1A1A1D] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden shadow-sm h-full">
          {/* List Action Bar */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 select-none">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Notlar ({filteredDocs.length})
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCreateNote}
                disabled={!selectedProjectId}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-blue-500 hover:text-blue-600 disabled:opacity-40 transition-colors"
                title="Yeni Not Ekle"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteNote}
                disabled={!activeDoc}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-400 hover:text-rose-500 disabled:opacity-40 transition-colors"
                title="Seçili Notu Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-neutral-200/40 dark:border-neutral-800/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Notlarda ara..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 text-xs text-neutral-950 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* List scrollable items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white dark:bg-[#1A1A1D]">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedNoteId(doc.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col text-left ${
                    isSelected
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm'
                      : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 border border-transparent'
                  }`}
                >
                  <h4 className="text-xs font-bold truncate">
                    {doc.title || 'Adsız Not'}
                  </h4>
                  
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-1 truncate">
                    {getSnippet(doc.content)}
                  </p>

                  <div className="flex items-center space-x-1.5 mt-2.5 text-[9px] text-neutral-400 select-none">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(doc.updated_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center space-y-2 select-none">
                <BookOpen className="w-8 h-8 opacity-40" />
                <span>Gösterilecek not yok</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editor & Preview */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-[#1A1A1D] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden shadow-sm h-full">
          {activeDoc ? (
            <>
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 select-none">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                    {isSaving ? 'Kaydediliyor...' : 'Otomatik Kaydedildi'}
                  </span>
                </div>

                {/* View Modes */}
                <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-900 p-1 text-[11px]">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                      viewMode === 'edit'
                        ? 'bg-white dark:bg-neutral-800 shadow-sm font-bold text-blue-500'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      viewMode === 'split'
                        ? 'bg-white dark:bg-neutral-800 shadow-sm font-bold text-blue-500'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    Bölünmüş
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                      viewMode === 'preview'
                        ? 'bg-white dark:bg-neutral-800 shadow-sm font-bold text-blue-500'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Önizleme</span>
                  </button>
                </div>
              </div>

              {/* Title Input & Editor Area */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                {/* Title (Apple Notes style borderless header) */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Not Başlığı"
                    className="w-full bg-transparent text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 focus:outline-none border-none p-0"
                  />
                  {selectedProject && (
                    <p className="text-[10px] font-mono text-neutral-400 mt-1 select-none">
                      Dosya: {selectedProject.local_path}\.projectos\\{title.trim().replace(/ /g, '_') || 'Adsiz_Not'}.md
                    </p>
                  )}
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                  {/* Markdown Edit Area */}
                  {(viewMode === 'edit' || viewMode === 'split') && (
                    <div className={`h-full flex flex-col ${viewMode === 'edit' ? 'md:col-span-2' : ''}`}>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Not içeriğinizi Markdown formatında yazabilirsiniz..."
                        className="w-full h-full flex-1 p-4 rounded-2xl bg-neutral-50/50 dark:bg-[#141416]/50 border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none leading-relaxed overflow-y-auto"
                      />
                    </div>
                  )}

                  {/* Markdown Preview Area */}
                  {(viewMode === 'preview' || viewMode === 'split') && (
                    <div
                      className={`p-5 rounded-2xl bg-white dark:bg-[#141416]/20 border border-neutral-200/80 dark:border-neutral-800 overflow-y-auto h-full prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed ${
                        viewMode === 'preview' ? 'md:col-span-2' : ''
                      }`}
                    >
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 space-y-3 select-none">
              <FileText className="w-10 h-10 opacity-30" />
              <p className="text-xs font-medium">Lütfen düzenlemek veya yeni eklemek için bir not seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
