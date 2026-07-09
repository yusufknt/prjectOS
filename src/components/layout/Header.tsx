import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Search, 
  RefreshCw, 
  GitBranch, 
  FolderOpen, 
  ExternalLink 
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useProjectStore } from '../../store/projectStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { 
    projects, 
    selectedProjectId, 
    gitStatuses, 
    refreshGitStatus, 
    setCommandPaletteOpen 
  } = useProjectStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const gitStatus = selectedProjectId ? gitStatuses[selectedProjectId] : null;

  const handleRefreshGit = async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    await refreshGitStatus(selectedProjectId);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <header className="h-16 px-6 glass-header flex items-center justify-between z-10 select-none">
      {/* Left: Project Info */}
      <div className="flex items-center space-x-4 min-w-0">
        {selectedProject ? (
          <div className="flex items-center space-x-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center space-x-2.5">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {selectedProject.name}
                </h2>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    selectedProject.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : selectedProject.status === 'completed'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {selectedProject.status === 'active'
                    ? 'Aktif'
                    : selectedProject.status === 'completed'
                      ? 'Tamamlandı'
                      : 'Beklemede'}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-mono truncate">{selectedProject.local_path}</span>
                {selectedProject.repository && (
                  <a
                    href={selectedProject.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition-colors flex items-center space-x-0.5"
                    title="Depoyu Aç"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {gitStatus && (
              <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-mono">
                  <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold">{gitStatus.branch}</span>
                </div>
                {gitStatus.modifiedFiles > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {gitStatus.modifiedFiles} modified
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm font-medium text-neutral-500">
            Lütfen sol menüden bir proje seçin
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center space-x-3 px-3.5 py-1.5 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all shadow-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Hızlı Ara...</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-lg bg-white dark:bg-neutral-800 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            Ctrl K
          </kbd>
        </button>

        {/* Refresh Git Status */}
        {selectedProject && (
          <button
            onClick={handleRefreshGit}
            title="Git Durumunu Yenile"
            className="p-2 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          className="p-2 rounded-2xl bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all shadow-sm"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-700" />
          )}
        </button>
      </div>
    </header>
  );
};
