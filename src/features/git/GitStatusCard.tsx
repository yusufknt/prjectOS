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
  if (!status) {
    return (
      <div className="p-6 rounded-3xl glass-panel text-center text-xs text-neutral-400">
        Git durumu okunamadı veya bu projenin yerel yolda Git deposu bulunmuyor.
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
    </div>
  );
};
