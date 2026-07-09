import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Save, 
  Clock,
  BookOpen,
  Layers,
  Scale,
  Lightbulb,
  FolderOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useProjectStore } from '../../store/projectStore';
import { WorkspaceDocumentType } from '../../types';

export const NotesEditor: React.FC = () => {
  const { 
    projects, 
    selectedProjectId, 
    workspaceDocs, 
    addWorkspaceDoc, 
    updateWorkspaceDoc, 
    deleteWorkspaceDoc,
    ensureProjectDocs 
  } = useProjectStore();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Proje seçildiğinde 4 temel çalışma alanı dosyasının olduğundan emin ol
  useEffect(() => {
    if (selectedProjectId) {
      ensureProjectDocs(selectedProjectId);
    }
  }, [selectedProjectId]);

  const projectDocs = selectedProjectId
    ? workspaceDocs.filter((d) => d.project_id === selectedProjectId)
    : workspaceDocs;

  const [activeTabType, setActiveTabType] = useState<WorkspaceDocumentType>('notes');

  // Aktif sekmedeki doküman
  const activeDoc =
    projectDocs.find((d) => d.doc_type === activeTabType) ||
    projectDocs[0] ||
    null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (activeDoc) {
      setTitle(activeDoc.title);
      setContent(activeDoc.content);
      setIsSaved(true);
    } else {
      setTitle('');
      setContent('');
    }
  }, [activeDoc?.id, activeTabType, selectedProjectId]);

  const handleSave = () => {
    if (!activeDoc) return;
    updateWorkspaceDoc(activeDoc.id, { title, content });
    setIsSaved(true);
  };

  const handleCreateCustomDoc = () => {
    if (!selectedProjectId) return;
    const newTitle = `Ekstra Geliştirme Notu (${new Date().toLocaleDateString('tr-TR')})`;
    addWorkspaceDoc({
      project_id: selectedProjectId,
      doc_type: activeTabType,
      title: newTitle,
      content: `# ${newTitle}\n\nDosya Tabanlı Çalışma Alanı özel Markdown dosyası.`,
    });
  };

  const docTabs: { id: WorkspaceDocumentType; label: string; filename: string; icon: any; color: string }[] = [
    {
      id: 'notes',
      label: 'Genel Notlar & Günlük',
      filename: 'notes.md',
      icon: BookOpen,
      color: 'text-blue-500',
    },
    {
      id: 'architecture',
      label: 'Sistem Mimarisi',
      filename: 'architecture.md',
      icon: Layers,
      color: 'text-purple-500',
    },
    {
      id: 'decisions',
      label: 'Kararlar (ADR)',
      filename: 'decisions.md',
      icon: Scale,
      color: 'text-emerald-500',
    },
    {
      id: 'ideas',
      label: 'Fikirler & Yol Haritası',
      filename: 'ideas.md',
      icon: Lightbulb,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Geliştirici Hafızası & Çalışma Alanı Dosyaları
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {selectedProject
              ? `"${selectedProject.name}" için Dosya Tabanlı (File-Based Workspace) Markdown belgeleri`
              : 'Tüm projelerin çalışma alanı dosyaları'}
          </p>
        </div>

        {selectedProject && (
          <button
            onClick={handleCreateCustomDoc}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ekstra Belge Ekle (.md)</span>
          </button>
        )}
      </div>

      {/* Developer Memory File Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {docTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTabType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabType(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center space-x-2.5 flex-shrink-0 ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-apple'
                  : 'glass-panel text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? '' : tab.color}`} />
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] opacity-70">({tab.filename})</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: Workspace Document Selector */}
        <div className="lg:col-span-1 p-4 rounded-3xl glass-panel space-y-3 h-fit max-h-[640px] overflow-y-auto">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {docTabs.find((t) => t.id === activeTabType)?.filename} Belgeleri
            </span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[10px] font-mono font-bold">
              {projectDocs.filter((d) => d.doc_type === activeTabType).length}
            </span>
          </div>

          <div className="space-y-1.5">
            {projectDocs
              .filter((d) => d.doc_type === activeTabType)
              .map((doc) => {
                const isSelected = doc.id === activeDoc?.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setTitle(doc.title);
                      setContent(doc.content);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start justify-between group ${
                      isSelected
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs truncate">{doc.title}</div>
                      <div className="text-[10px] text-neutral-400 mt-1 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(doc.updated_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkspaceDoc(doc.id);
                      }}
                      className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Belgeyi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

            {projectDocs.filter((d) => d.doc_type === activeTabType).length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                Bu kategoride belge yok
              </div>
            )}
          </div>
        </div>

        {/* Right 3 Cols: Editor & Preview */}
        <div className="lg:col-span-3 p-6 rounded-3xl glass-panel flex flex-col space-y-4 min-h-[580px]">
          {activeDoc ? (
            <>
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200/60 dark:border-neutral-800/60 pb-4">
                <div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full bg-transparent text-base font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                  {selectedProject && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <FolderOpen className="w-3 h-3" />
                      <span>
                        {selectedProject.local_path}\\{docTabs.find((t) => t.id === activeTabType)?.filename}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* View Mode Switchers */}
                  <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-[#141416] p-1 text-xs">
                    <button
                      onClick={() => setViewMode('edit')}
                      className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                        viewMode === 'edit'
                          ? 'bg-white dark:bg-neutral-800 shadow-sm font-semibold text-blue-500'
                          : 'text-neutral-500'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Düzenle</span>
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        viewMode === 'split'
                          ? 'bg-white dark:bg-neutral-800 shadow-sm font-semibold text-blue-500'
                          : 'text-neutral-500'
                      }`}
                    >
                      Bölünmüş
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                        viewMode === 'preview'
                          ? 'bg-white dark:bg-neutral-800 shadow-sm font-semibold text-blue-500'
                          : 'text-neutral-500'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Önizleme</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaved}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                      isSaved
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Kaydedildi' : 'Dosyaya Kaydet'}</span>
                  </button>
                </div>
              </div>

              {/* Split / Edit / Preview */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(viewMode === 'edit' || viewMode === 'split') && (
                  <div className={viewMode === 'edit' ? 'md:col-span-2' : ''}>
                    <textarea
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setIsSaved(false);
                      }}
                      placeholder="Markdown formatında içerik yazın..."
                      className="w-full h-full min-h-[420px] p-4 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
                    />
                  </div>
                )}

                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div
                    className={`p-5 rounded-2xl bg-white dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 overflow-y-auto min-h-[420px] prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed ${
                      viewMode === 'preview' ? 'md:col-span-2' : ''
                    }`}
                  >
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <FileText className="w-10 h-10" />
              <p className="text-xs font-medium">Bu sekmede gösterilecek belge seçilmedi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
