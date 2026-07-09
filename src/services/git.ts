import { invoke } from '@tauri-apps/api/core';
import { GitStatus } from '../types';

export const gitService = {
  async getGitStatus(projectId: string, localPath: string): Promise<GitStatus> {
    try {
      const status = await invoke<GitStatus>('get_git_status_real', { projectPath: localPath });
      return {
        ...status,
        lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch (e) {
      console.error(`Git durumu okunurken hata (${projectId}):`, e);
      // Hata durumunda veya git deposu olmayan klasörlerde fallback değerler döner
      return {
        branch: 'Git Yok',
        lastCommitMessage: String(e),
        lastCommitTime: '-',
        lastPushTime: '-',
        remoteUrl: '',
        modifiedFiles: 0,
        stagedFiles: 0,
        untrackedFiles: 0,
        ahead: 0,
        behind: 0,
        lastUpdated: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    }
  },
};
