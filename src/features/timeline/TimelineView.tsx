import React, { useState } from 'react';
import { 
  Clock, 
  GitCommit, 
  FileText, 
  CheckSquare, 
  Activity, 
  FolderGit2,
  Filter
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { TimelineEventType } from '../../types';

export const TimelineView: React.FC = () => {
  const { projects, selectedProjectId, timeline } = useProjectStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  const filteredTimeline = timeline.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesProject =
      filterProject === 'all' || item.project_id === filterProject;
    return matchesType && matchesProject;
  });

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'git_commit':
        return {
          icon: GitCommit,
          bgColor: 'bg-blue-500/10 text-blue-500',
          label: 'Git Commit',
        };
      case 'note_created':
        return {
          icon: FileText,
          bgColor: 'bg-indigo-500/10 text-indigo-500',
          label: 'Not Eklendi',
        };
      case 'task_updated':
        return {
          icon: CheckSquare,
          bgColor: 'bg-emerald-500/10 text-emerald-500',
          label: 'Görev İşlemi',
        };
      default:
        return {
          icon: Activity,
          bgColor: 'bg-purple-500/10 text-purple-500',
          label: 'Proje İşlemi',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Aktivite ve Zaman Akışı
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tüm projelerin geçmişi, Git bildirimleri ve yapılan güncellemeler kronolojik olarak kayıt altında
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">Tüm Projeler</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="all">Tüm Etkinlik Tipleri</option>
            <option value="git_commit">Git Commitleri</option>
            <option value="task_updated">Görev Güncellemeleri</option>
            <option value="note_created">Not Eklemeleri</option>
            <option value="status_change">Proje Durumları</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="p-6 rounded-3xl glass-panel relative">
        {/* Vertical Line */}
        <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />

        <div className="space-y-6 relative">
          {filteredTimeline.map((item) => {
            const project = projects.find((p) => p.id === item.project_id);
            const { icon: Icon, bgColor, label } = getEventIcon(item.type);

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-5"
              >
                {/* Timeline Node Icon */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 ${bgColor} border border-neutral-200/60 dark:border-neutral-800`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Event Content Card */}
                <div className="flex-1 w-full p-4 rounded-2xl bg-neutral-50/80 dark:bg-[#141416] border border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        {label}
                      </span>
                      {project && (
                        <>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {project.name}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-neutral-400 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredTimeline.length === 0 && (
            <div className="py-16 text-center text-xs text-neutral-400">
              Seçilen kriterlere uygun aktivite bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
