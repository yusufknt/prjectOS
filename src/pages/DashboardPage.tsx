import React from 'react';
import { 
  FolderGit2, 
  CheckSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ExternalLink,
  Plus,
  CloudUpload
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenNewProjectModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenNewProjectModal,
}) => {
  const { 
    projects, 
    tasks, 
    updateTaskStatus, 
    toggleProjectPushed,
    selectProject 
  } = useProjectStore();

  const pushedProjectsCount = projects.filter((p) => p.pushed).length;
  const unpushedProjectsCount = projects.length - pushedProjectsCount;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Genel Bakış
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Projelerinizin GitHub push durumu ve genel yapılacaklar
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('projects')}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-sm"
          >
            Tüm Projeler ({projects.length})
          </button>
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Proje Ekle</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('projects')}
          className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition-all shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-neutral-500">Kayıtlı Projeler</span>
            <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {projects.length}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition-all shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-neutral-500">GitHub'a Pushlanan</span>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {pushedProjectsCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all shadow-sm"
        >
          <div>
            <span className="text-xs font-medium text-neutral-500">Push Bekleyen</span>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {unpushedProjectsCount}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Status List & General Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-blue-500" />
              <span>Projeler & Son Notlar</span>
            </h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-blue-500 hover:underline flex items-center space-x-1"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {project.name}
                    </span>
                    {project.repository && (
                      <a
                        href={project.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-blue-500"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {project.description || 'Not eklenmedi.'}
                  </p>
                </div>

                <button
                  onClick={() => toggleProjectPushed(project.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                    project.pushed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {project.pushed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Pushlandı</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Beklemede</span>
                    </>
                  )}
                </button>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400">
                Henüz proje eklemediniz.
              </div>
            )}
          </div>
        </div>

        {/* General Tasks List (Apple Reminders Style) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800/80 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
              <span>Hızlı Yapılacaklar</span>
            </h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-blue-500 hover:underline flex items-center space-x-1"
            >
              <span>Tüm Yapılacaklar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => {
              const isDone = task.status === 'done';
              return (
                <div
                  key={task.id}
                  onClick={() => updateTaskStatus(task.id, isDone ? 'todo' : 'done')}
                  className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    isDone
                      ? 'bg-neutral-100/50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/50 opacity-60'
                      : 'bg-neutral-50 dark:bg-[#141416] border-neutral-200/80 dark:border-neutral-800 hover:border-blue-500/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer flex-shrink-0"
                  />
                  <span
                    className={`text-xs font-medium text-neutral-800 dark:text-neutral-200 ${
                      isDone ? 'line-through text-neutral-400' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400">
                Yapılacak görev bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
