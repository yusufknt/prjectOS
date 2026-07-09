import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  X, 
  CheckCircle2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { NavTab } from '../components/layout/Sidebar';

interface ProjectsPageProps {
  onNavigate: (tab: NavTab) => void;
  isNewModalOpen: boolean;
  onCloseNewModal: () => void;
  onOpenNewModal: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  onNavigate,
  isNewModalOpen,
  onCloseNewModal,
  onOpenNewModal,
}) => {
  const { projects, selectProject, addProject, updateProject, deleteProject, toggleProjectPushed } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for New Project Modal
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repository, setRepository] = useState('');
  const [pushed, setPushed] = useState(true);

  // Edit Note State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      name: name.trim(),
      description: description.trim() || 'Yeni eklendi.',
      repository: repository.trim(),
      pushed,
      status: 'active',
    });

    setName('');
    setDescription('');
    setRepository('');
    setPushed(true);
    onCloseNewModal();
  };

  const startEditingNote = (project: any) => {
    setEditingProjectId(project.id);
    setEditNoteText(project.description || '');
  };

  const saveEditedNote = (id: string) => {
    updateProject(id, { description: editNoteText.trim() });
    setEditingProjectId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Projelerim
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Aktif projeleriniz ve en son yaptığınız çalışmaların takibi
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Proje Ekle</span>
        </button>
      </div>

      {/* Clean Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Projelerde veya son notlarda ara..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between space-y-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm group"
          >
            <div className="space-y-3">
              {/* Top Row: Name & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 flex-shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      onClick={() => {
                        selectProject(project.id);
                        onNavigate('dashboard');
                      }}
                      className="text-base font-bold text-neutral-900 dark:text-neutral-100 truncate cursor-pointer hover:text-blue-500 transition-colors"
                    >
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-neutral-400">
                      <span>Güncelleme: {new Date(project.updated_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:text-blue-500 transition-colors"
                      title="GitHub Deposu"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm(`"${project.name}" projesini silmek istediğinize emin misiniz?`)) {
                        deleteProject(project.id);
                      }
                    }}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                    title="Projeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note / Last Action Area */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/50 dark:border-neutral-800/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    En Son Ne Yaptım?
                  </span>
                  {editingProjectId !== project.id && (
                    <button
                      onClick={() => startEditingNote(project)}
                      className="text-[11px] text-blue-500 hover:underline flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Düzenle</span>
                    </button>
                  )}
                </div>

                {editingProjectId === project.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-blue-500/50 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => saveEditedNote(project.id)}
                        className="px-3 py-1 rounded-lg text-[11px] bg-blue-600 text-white font-semibold"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed break-words">
                    {project.description || 'Henüz bir not yazılmadı.'}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Row: Push Status Apple Toggle */}
            <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between">
              <button
                onClick={() => toggleProjectPushed(project.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition-all ${
                  project.pushed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                }`}
              >
                {project.pushed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>GitHub’a Pushlandı</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Henüz Pushlanmadı (Bekliyor)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  selectProject(project.id);
                  onNavigate('dashboard');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-all"
              >
                İncele
              </button>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800">
            <FolderGit2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Gösterilecek proje bulunamadı
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Sağ üstteki "Yeni Proje Ekle" butonuna basarak projenizi ekleyebilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* New Project Modal (Süper Yalın Apple Stili - Dizin yolu yok!) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-lg border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Yeni Proje Ekle
              </h3>
              <button
                onClick={onCloseNewModal}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Proje Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: ProjectOS App"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  En Son Ne Yaptım? / Not
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Buton tasarımlarını bitirdim, giriş sayfasını tamamladım..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  GitHub Depo Linki (İsteğe Bağlı)
                </label>
                <input
                  type="url"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  placeholder="https://github.com/yusuf/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              {/* GitHub Push Durumu */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Son Değişiklikleri GitHub'a Pushladım mı?
                </span>
                <input
                  type="checkbox"
                  checked={pushed}
                  onChange={(e) => setPushed(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onCloseNewModal}
                  className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
                >
                  Projeyi Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
