import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Search,
  BookOpen,
  Calendar,
  Cloud,
  CloudLightning
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

  // Küresel notları yükle
  useEffect(() => {
    ensureProjectDocs('global');
  }, []);

  const projectDocs = workspaceDocs;

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

  // Otomatik Kaydetme (Autosave & Autorename) — 500ms gecikmeli
  useEffect(() => {
    if (!activeDoc) return;

    // Eğer disktekiyle aynıysa kaydetmeye çalışma
    if (title === activeDoc.title && content === activeDoc.content) {
      return;
    }

    setIsSaving(true);
    const saveTimer = setTimeout(async () => {
      try {
        // 1. Başlık değiştiyse dosya adını güncelle
        if (title !== activeDoc.title && title.trim() !== '') {
          await renameWorkspaceDoc(activeDoc.id, title);
        }
        
        // 2. İçerik ve başlığı kaydet
        await updateWorkspaceDoc(activeDoc.id, { title, content });
      } catch (err) {
        console.error("Not kaydedilemedi:", err);
      } finally {
        setIsSaving(false);
      }
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [title, content, activeDoc?.id]);

  // Yeni Not Ekleme
  const handleCreateNote = async () => {
    const newTitle = `Yeni Not (${new Date().toLocaleDateString('tr-TR')})`;
    const defaultContent = `# ${newTitle}\n\nNot detaylarını buraya yazabilirsiniz.`;
    await addWorkspaceDoc({
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
    const cleanText = text
      .replace(/[#*`_\-]/g, '')
      .replace(/\[.*\]\(.*\)/g, '')
      .trim();
    if (cleanText.length > 50) {
      return cleanText.substring(0, 50) + '...';
    }
    return cleanText || 'Boş Not';
  };

  return (
    <div className="h-[calc(100vh-130px)] overflow-hidden">
      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
        
        {/* Left Column: Notes List (Sidebar) */}
        <div className="lg:col-span-1 flex flex-col bg-white dark:bg-[#1A1A1D] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden shadow-sm h-full">
          {/* List Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 select-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Notlarım ({filteredDocs.length})
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleCreateNote}
                className="p-1.5 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-blue-500 hover:text-blue-600 transition-colors"
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
                <span>Henüz not yok</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Clean Editor */}
        <div className="lg:col-span-3 flex flex-col bg-white dark:bg-[#1A1A1D] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden shadow-sm h-full">
          {activeDoc ? (
            <>
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 select-none">
                <div className="flex items-center space-x-2 text-[11px] font-semibold">
                  {isSaving ? (
                    <>
                      <CloudLightning className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span className="text-blue-500">Diske kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 text-emerald-500" />
                      <span className="text-neutral-500 dark:text-neutral-400">Buluta eşitlenmeye hazır (Kaydedildi)</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] font-mono text-neutral-400">
                  notes\{title.trim().replace(/ /g, '_') || 'Adsiz_Not'}.md
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
                    className="w-full bg-transparent text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 focus:outline-none border-none p-0 focus:ring-0 focus:ring-offset-0"
                  />
                </div>

                {/* Plain Text Editor Area */}
                <div className="flex-1 overflow-hidden">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Notlarınızı buraya yazın..."
                    className="w-full h-full p-4 rounded-2xl bg-neutral-50/40 dark:bg-[#141416]/40 border border-neutral-200/60 dark:border-neutral-800 text-xs font-sans leading-relaxed text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none overflow-y-auto"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 space-y-3 select-none">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-xs font-medium">Lütfen düzenlemek veya yeni eklemek için bir not seçin</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
