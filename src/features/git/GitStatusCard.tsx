import React from 'react';
import { 
  GitBranch, 
  GitCommit, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  FileEdit, 
  FilePlus, 
  RefreshCw 
} from 'lucide-react';
import { GitStatus } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { invoke } from '@tauri-apps/api/core';

interface GitStatusCardProps {
  status: GitStatus | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const GitStatusCard: React.FC<GitStatusCardProps> = ({
  status,
  onRefresh,
  isRefreshing = false,
}) => {
  const { projects, selectedProjectId, refreshGitStatus } = useProjectStore();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = React.useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handlePull = async () => {
    if (!selectedProject) return;
    setIsSyncing(true);
    setSyncStatusMsg('GitHub\'dan çekiliyor...');
    try {
      await invoke('git_pull', { projectPath: selectedProject.local_path });
      setSyncStatusMsg('Güncellemeler başarıyla çekildi! ✅');
      refreshGitStatus(selectedProject.id);
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch (e) {
      alert(`Pull hatası: ${e}`);
      setSyncStatusMsg('Çekme işlemi başarısız ❌');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePush = async () => {
    if (!selectedProject) return;
    setIsSyncing(true);
    setSyncStatusMsg('GitHub\'a gönderiliyor...');
    const now = new Date().toLocaleString('tr-TR');
    const commitMessage = `ProjectOS Sync: ${now}`;
    try {
      await invoke('git_push', { 
        projectPath: selectedProject.local_path,
        commitMessage: commitMessage
      });
      setSyncStatusMsg('Başarıyla pushlandı! ✅');
      refreshGitStatus(selectedProject.id);
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch (e) {
      alert(`Push hatası: ${e}`);
      setSyncStatusMsg('Gönderme işlemi başarısız ❌');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!status) {
    return (
      <div className="p-6 rounded-3xl glass-panel text-center text-xs text-neutral-400 space-y-4">
        <p>Git durumu okunamadı veya bu projenin yerel yolda Git deposu bulunmuyor.</p>
        {selectedProject && (
          <p className="text-[10px] text-neutral-500 font-mono">Dizin: {selectedProject.local_path}</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl glass-panel space-y-5 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                {status.branch}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Son okuma: {status.lastUpdated}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-blue-500 transition-colors"
          title="Yenile (Otomatik 5 dk interval)"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Commit Info */}
      <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#1A1A1D] border border-neutral-200/60 dark:border-neutral-800/60 space-y-2">
        <div className="flex items-start space-x-2.5">
          <GitCommit className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
              {status.lastCommitMessage}
            </p>
            <div className="flex items-center space-x-3 mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Commit: {status.lastCommitTime}</span>
              </span>
              <span>•</span>
              <span>Push: {status.lastPushTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Stats & Sync Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Değişen</span>
            <FileEdit className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-1">
            {status.modifiedFiles}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Untracked</span>
            <FilePlus className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-1">
            {status.untrackedFiles}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Ahead</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            +{status.ahead}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#141416] border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-medium">Behind</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-base font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">
            -{status.behind}
          </span>
        </div>
      </div>

      {/* GitHub Sync Actions */}
      {selectedProject && (
        <div className="space-y-2 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-neutral-500">GitHub Senkronizasyonu</span>
            {syncStatusMsg && (
              <span className="text-[10px] text-blue-500 font-medium animate-pulse">{syncStatusMsg}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePull}
              disabled={isSyncing}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 text-xs font-semibold border border-neutral-250/30 dark:border-neutral-750/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-purple-500" />
              <span>Pull (Çek)</span>
            </button>

            <button
              onClick={handlePush}
              disabled={isSyncing}
              className="flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-blue-500/10"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Push (Gönder)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
