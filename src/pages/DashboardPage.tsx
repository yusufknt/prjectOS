import React, { useState } from 'react';
import { 
  FolderGit2, 
  CheckSquare, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ExternalLink,
  Flame
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { GitStatusCard } from '../features/git/GitStatusCard';
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
    selectedProjectId, 
    tasks, 
    timeline, 
    gitStatuses, 
    refreshGitStatus, 
    updateTaskStatus, 
    selectProject 
  } = useProjectStore();

  const [isRefreshingGit, setIsRefreshingGit] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const gitStatus = selectedProjectId ? gitStatuses[selectedProjectId] : null;

  const activeProjects = projects.filter((p) => p.status === 'active');
  const pendingProjects = projects.filter((p) => p.status === 'pending');
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status !== 'done');
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;

  const handleRefreshGit = async () => {
    if (!selectedProjectId) return;
    setIsRefreshingGit(true);
    await refreshGitStatus(selectedProjectId);
    setTimeout(() => setIsRefreshingGit(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Geliştirme Kontrol Paneli
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tüm projeleriniz, Git durumları ve güncel odak maddeleriniz tek ekranda
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('projects')}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all shadow-sm"
          >
            Tüm Projeleri Gör ({projects.length})
          </button>
          <button
            onClick={onOpenNewProjectModal}
            className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
          >
            + Yeni Proje Ekle
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Aktif Projeler</span>
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {activeProjects.length}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              +{pendingProjects.length} bekleyen proje
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Yüksek Öncelikli Odak</span>
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {highPriorityTasks.length}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Açık yüksek öncelikli görev</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Tamamlanan Görevler</span>
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {completedTasksCount} / {tasks.length}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}% tamamlanma oranı
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Aktivite Akışı</span>
            <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {timeline.length}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Toplam kayıtlı işlem / log</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Selected Project Git Status + Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Git Status Card of Selected Project */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {selectedProject ? `${selectedProject.name} — Git Durumu` : 'Seçili Proje Git Durumu'}
            </h2>
            {selectedProject && (
              <button
                onClick={() => onNavigate('projects')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center space-x-1"
              >
                <span>Proje Detayına Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <GitStatusCard
            status={gitStatus}
            onRefresh={handleRefreshGit}
            isRefreshing={isRefreshingGit}
          />

          {/* Active Projects Quick Cards */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Aktif Projeler & İlerleme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  className={`p-4 rounded-3xl glass-panel cursor-pointer transition-all ${
                    project.id === selectedProjectId
                      ? 'border-blue-500/60 dark:border-blue-500/60 ring-2 ring-blue-500/20'
                      : 'hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {project.name}
                    </span>
                    <span className="text-[11px] font-mono text-blue-500 font-bold">
                      %{project.progress}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-1">
                    {project.description}
                  </p>

                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Today's Focus & Recent Timeline */}
        <div className="space-y-6">
          {/* Today's Focus Card */}
          <div className="p-5 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Bugünkü Odak
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-[11px] text-blue-500 hover:underline font-medium"
              >
                Kanban'a Git
              </button>
            </div>

            <div className="space-y-2">
              {highPriorityTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Yüksek öncelikli açık görev kalmadı! Harikadır 🎉
                </div>
              ) : (
                highPriorityTasks.slice(0, 4).map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800/60 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <button
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          title="Tamamlandı Olarak İşaretle"
                          className="mt-0.5 text-neutral-400 hover:text-emerald-500 transition-colors flex-shrink-0"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2">
                            {task.title}
                          </p>
                          {project && (
                            <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {project.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Timeline Feed */}
          <div className="p-5 rounded-3xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                Son Aktiviteler
              </h3>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-[11px] text-blue-500 hover:underline font-medium"
              >
                Tümü
              </button>
            </div>

            <div className="space-y-3">
              {timeline.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {item.content}
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(item.created_at).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
