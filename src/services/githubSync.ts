import { CloudSyncSettings } from '../types';

const CLOUD_SETTINGS_KEY = 'project_os_cloud_settings';

export interface CloudDataPayload {
  projects: any[];
  notes: any[];
  tasks: any[];
  syncedAt: string;
}

export const githubSyncService = {
  getSettings(): CloudSyncSettings {
    const data = localStorage.getItem(CLOUD_SETTINGS_KEY);
    if (!data) return {};
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  },

  saveSettings(settings: CloudSyncSettings): void {
    localStorage.setItem(CLOUD_SETTINGS_KEY, JSON.stringify(settings));
  },

  async pushToCloud(payload: { projects: any[]; notes: any[]; tasks: any[] }): Promise<{ success: boolean; message: string; gistId?: string }> {
    const settings = this.getSettings();
    if (!settings.token) {
      return {
        success: false,
        message: 'GitHub Token girilmemiş. Lütfen sağ üstteki Bulut Ayarları penceresinden Token girin.',
      };
    }

    const fileContent = JSON.stringify({
      projects: payload.projects,
      notes: payload.notes,
      tasks: payload.tasks,
      syncedAt: new Date().toISOString(),
    }, null, 2);

    try {
      const headers = {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${settings.token}`,
        'Content-Type': 'application/json',
      };

      if (settings.gistId) {
        // Mevcut Gist'i güncelle
        const response = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            description: 'ProjectOS Cloud Backup (Mac & PC Sync)',
            files: {
              'project_os_data.json': {
                content: fileContent,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`GitHub Gist güncellenemedi (${response.status})`);
        }

        const now = new Date().toISOString();
        this.saveSettings({ ...settings, lastSyncedAt: now });
        return { success: true, message: 'Veriler başarıyla GitHub Gist bulutuna eşitleme yapıldı!' };
      } else {
        // Yeni Gist oluştur
        const response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            description: 'ProjectOS Cloud Backup (Mac & PC Sync)',
            public: false,
            files: {
              'project_os_data.json': {
                content: fileContent,
              },
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`GitHub Gist oluşturulamadı (${response.status})`);
        }

        const resData = await response.json();
        const now = new Date().toISOString();
        this.saveSettings({ ...settings, gistId: resData.id, lastSyncedAt: now });

        return {
          success: true,
          message: 'Yeni GitHub Gist oluşturuldu ve veriler eşitleme yapıldı!',
          gistId: resData.id,
        };
      }
    } catch (e: any) {
      console.error('GitHub Sync hatası:', e);
      return {
        success: false,
        message: e?.message || 'Bulut eşitleme başarısız oldu.',
      };
    }
  },

  async pullFromCloud(): Promise<{ success: boolean; data?: CloudDataPayload; message: string }> {
    const settings = this.getSettings();
    if (!settings.token || !settings.gistId) {
      return {
        success: false,
        message: 'GitHub Token veya Gist ID eksik.',
      };
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${settings.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub Gist okunamadı (${response.status})`);
      }

      const resData = await response.json();
      const file = resData.files?.['project_os_data.json'];
      if (!file || !file.content) {
        throw new Error('Gist içinde project_os_data.json bulunamadı.');
      }

      const parsed = JSON.parse(file.content);
      const now = new Date().toISOString();
      this.saveSettings({ ...settings, lastSyncedAt: now });

      return {
        success: true,
        data: parsed,
        message: 'Buluttan tüm veriler (projeler, notlar, görevler) başarıyla yüklendi!',
      };
    } catch (e: any) {
      console.error('Pull From Cloud hatası:', e);
      return {
        success: false,
        message: e?.message || 'Buluttan veri çekilemedi.',
      };
    }
  },
};
