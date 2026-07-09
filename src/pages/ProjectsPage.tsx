import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  FolderOpen, 
  ExternalLink, 
  Trash2, 
  X, 
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { ProjectStatus } from '../types';
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
  const { projects, selectProject, addProject, deleteProject } = useProjectStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for New Project Modal
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localPath, setLocalPath] = useState('C:\\Users\\yusuf\\Projects\\');
  const [repository, setRepository] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [progress, setProgress] = useState(10);

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.local_path.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !localPath.trim()) return;

    addProject({
      name,
      description,
      local_path: localPath,
      repository,
      status,
      progress: Number(progress),
    });

    setName('');
    setDescription('');
    setLocalPath('C:\\Users\\yusuf\\Projects\\');
    setRepository('');
    setStatus('active');
    setProgress(10);
    onCloseNewModal();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Projeler ({projects.length})
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Yerel bilgisayarınızdaki tüm yazılım projelerini tek merkezden yönetin
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

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl glass-panel">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Proje adı, açıklama veya dizin yolu ara..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'active', label: 'Aktif' },
            { id: 'pending', label: 'Beklemede' },
            { id: 'completed', label: 'Tamamlanan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                filterStatus === item.id
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-6 rounded-3xl glass-panel flex flex-col justify-between space-y-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
          >
            <div className="space-y-3">
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
                    <div className="flex items-center space-x-2 mt-0.5 text-xs text-neutral-500 font-mono truncate">
                      <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{project.local_path}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      project.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : project.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {project.status === 'active'
                      ? 'Aktif'
                      : project.status === 'completed'
                        ? 'Tamamlandı'
                        : 'Beklemede'}
                  </span>

                  <button
                    onClick={() => {
                      if (window.confirm(`"${project.name}" projesini silmek istediğinize emin misiniz?`)) {
                        deleteProject(project.id);
                      }
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Projeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Footer progress and actions */}
            <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Tamamlanma İlerlemesi</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    %{project.progress}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                  <span>Güncelleme:</span>
                  <span>{new Date(project.updated_at).toLocaleDateString('tr-TR')}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {project.repository && (
                    <a
                      href={project.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Git Repo</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      selectProject(project.id);
                      onNavigate('dashboard');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    Detaylar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl glass-panel">
            <FolderGit2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Gösterilecek proje bulunamadı
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Arama kriterlerinizi değiştirebilir veya yeni bir proje oluşturabilirsiniz.
            </p>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-apple-lg border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Yeni Proje Oluştur
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
                  placeholder="Örn: ProjectOS Masaüstü"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Yerel Dizin Yolu (Local Path) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="C:\Users\yusuf\Projects\app-name"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Projenin amacı, kullanılan teknolojiler vb."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Git Remote URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Durum
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141416] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="pending">Beklemede</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  <span>Başlangıç İlerlemesi</span>
                  <span className="font-mono">%{progress}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-blue-600"
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
                  Projeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
