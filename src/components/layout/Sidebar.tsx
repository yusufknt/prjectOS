import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  CheckSquare, 
  FileText, 
  Clock, 
  Plus, 
  Folder,
  ChevronRight,
  Command
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

export type NavTab = 'dashboard' | 'projects' | 'tasks' | 'notes';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewProjectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewProjectModal,
}) => {
  const { projects, selectedProjectId, selectProject, setCommandPaletteOpen } = useProjectStore();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'projects' as NavTab, label: 'Projeler & Notlar', icon: FolderGit2 },
    { id: 'tasks' as NavTab, label: 'Yapılacaklar', icon: CheckSquare },
    { id: 'notes' as NavTab, label: 'Not Defteri', icon: FileText },
  ];

  return (
    <aside className="w-64 flex flex-col bg-[#F6F6F8]/80 dark:bg-[#121214]/80 backdrop-blur-2xl border-r border-neutral-200/80 dark:border-neutral-800/80 select-none h-full z-20">
      {/* App Branding */}
      <div className="p-5 flex items-center justify-between border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              ProjectOS
            </h1>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              Masaüstü v1.0
            </p>
          </div>
        </div>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          title="Hızlı Arama (Ctrl+K)"
          className="p-1.5 rounded-xl hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <Command className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Gezinti
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-[#1C1C1E] text-blue-600 dark:text-blue-400 shadow-apple dark:shadow-apple-dark font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </button>
          );
        })}
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Aktif Projeler ({projects.length})
          </span>
          <button
            onClick={onOpenNewProjectModal}
            className="p-1 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-500 hover:text-blue-500 transition-colors"
            title="Yeni Proje Ekle"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((project) => {
            const isSelected = project.id === selectedProjectId;
            return (
              <button
                key={project.id}
                onClick={() => {
                  selectProject(project.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/60'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate pr-2">
                  <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-neutral-400'}`} />
                  <span className="truncate">{project.name}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <span className={`w-2 h-2 rounded-full ${
                    project.status === 'active' 
                      ? 'bg-emerald-500' 
                      : project.status === 'completed' 
                        ? 'bg-blue-500' 
                        : 'bg-amber-500'
                  }`} />
                  {isSelected && <ChevronRight className="w-3 h-3 text-blue-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <button
          onClick={onOpenNewProjectModal}
          className="w-full py-2.5 px-4 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Proje Oluştur</span>
        </button>
      </div>
    </aside>
  );
};
