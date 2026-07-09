import React from 'react';
import { 
  FolderGit2, 
  FolderOpen, 
  ExternalLink, 
  CheckSquare, 
  FileText, 
  Clock, 
  Sliders,
  BookOpen,
  Layers,
  Scale,
  Lightbulb
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { GitStatusCard } from '../features/git/GitStatusCard';
import { NavTab } from '../components/layout/Sidebar';
import { ProjectStatus } from '../types';

interface ProjectDetailPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ onNavigate }) => {
  const { 
    projects, 
    selectedProjectId, 
    gitStatuses, 
    refreshGitStatus, 
    updateProject,
    tasks,
    workspaceDocs,
    timeline 
  } = useProjectStore();

  const project = projects.find((p) => p.id === selectedProjectId);
  const gitStatus = selectedProjectId ? gitStatuses[selectedProjectId] : null;

  if (!project) {
    return (
      <div className="p-12 rounded-3xl glass-panel text-center">
        <FolderGit2 className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Proje seçilmedi
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Sol menüden bir proje seçebilir veya Projeler sekmesinden yeni bir proje oluşturabilirsiniz.
        </p>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const projectDocs = workspaceDocs.filter((d) => d.project_id === project.id);
  const projectTimeline = timeline.filter((t) => t.project_id === project.id);

  const docFilesBadge = [
    { label: 'notes.md', icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'architecture.md', icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'decisions.md', icon: Scale, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'ideas.md', icon: Lightbulb, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {project.name}
                </h1>
                <select
                  value={project.status}
                  onChange={(e) =>
                    updateProject(project.id, { status: e.target.value as ProjectStatus })
                  }
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#141416] border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  <option value="active">Aktif</option>
                  <option value="pending">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('tasks')}
              className="px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#141416] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center space-x-1.5"
            >
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span>Görevler ({projectTasks.length})</span>
            </button>

            <button
              onClick={() => onNavigate('notes')}
              className="px-3.5 py-2 rounded-2xl bg-neutral-100 dark:bg-[#141416] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Geliştirici Hafızası ({projectDocs.length})</span>
            </button>
          </div>
        </div>

        {/* Workspace Files Overview */}
        <div className="pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 mr-1">
                Çalışma Alanı Dosyaları:
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono bg-neutral-100 dark:bg-[#141416] text-neutral-600 dark:text-neutral-300">
                project.json
              </span>
              {docFilesBadge.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.label}
                    onClick={() => onNavigate('notes')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-all hover:scale-105 ${b.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{b.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="w-full sm:w-64 flex items-center space-x-3">
              <Sliders className="w-4 h-4 text-neutral-400 flex-shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) => updateProject(project.id, { progress: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
              <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 w-10 text-right">
                %{project.progress}
              </span>
            </div>
          </div>
        </div>

        {/* Local Path */}
        <div className="pt-3 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-neutral-400" />
            <span className="font-mono bg-neutral-100 dark:bg-[#141416] px-2.5 py-1 rounded-xl text-neutral-700 dark:text-neutral-300">
              {project.local_path}
            </span>
          </div>

          {project.repository && (
            <a
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors flex items-center space-x-1"
            >
              <span>GitHub Uzak Depo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Git Status Card */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Yerel Git Deposu Durumu
        </h2>
        <GitStatusCard
          status={gitStatus}
          onRefresh={() => refreshGitStatus(project.id)}
        />
      </div>

      {/* Recent Project Activity Preview */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Proje Zaman Akışı ({projectTimeline.length})
          </h3>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-xs text-blue-500 hover:underline font-medium"
          >
            Tüm Akışı İncele
          </button>
        </div>

        <div className="space-y-3">
          {projectTimeline.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-800 dark:text-neutral-200">{item.content}</span>
              </div>
              <span className="text-[11px] text-neutral-400">
                {new Date(item.created_at).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
