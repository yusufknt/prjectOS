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

  async findExistingProjectOSGist(token: string): Promise<string | null> {
    try {
      const res = await fetch('https://api.github.com/gists?per_page=100', {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const gists = await res.json();
      if (!Array.isArray(gists)) return null;
      const found =
        gists.find((g: any) => g.files && g.files['project_os_data.json']) ||
        gists.find((g: any) => g.description && g.description.includes('ProjectOS'));
      return found ? found.id : null;
    } catch {
      return null;
    }
  },

  async pushToCloud(payload: { projects: any[]; notes: any[]; tasks: any[] }): Promise<{ success: boolean; message: string; gistId?: string }> {
    const settings = this.getSettings();
    const token = settings.token?.trim();
    let gistId = settings.gistId?.trim();

    if (!token) {
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

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // Eğer gistId yoksa, önce mevcut gistler arasında ProjectOS yedeği var mı ara
      if (!gistId) {
        const found = await this.findExistingProjectOSGist(token);
        if (found) gistId = found;
      }

      if (gistId) {
        // Mevcut Gist'i güncelle
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
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

        if (response.status === 401) {
          return { success: false, message: 'GitHub Token geçersiz (401 Unauthorized). Lütfen Token bilginizi kontrol edin.' };
        }
        if (response.status === 403) {
          return { success: false, message: 'GitHub API yetki hatası (403). Token oluştururken "gist" yetkisini işaretlediğinizden emin olun.' };
        }

        if (response.ok) {
          const now = new Date().toISOString();
          this.saveSettings({ ...settings, token, gistId, lastSyncedAt: now });
          return { success: true, message: 'Veriler başarıyla GitHub Gist bulutuna eşitleme yapıldı!', gistId };
        }
        // Eğer 404 döndüyse (gist silinmiş vs.), aşağıda yeni gist oluşturalım
      }

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

      if (response.status === 401) {
        return { success: false, message: 'GitHub Token geçersiz (401 Unauthorized).' };
      }
      if (response.status === 403) {
        return { success: false, message: 'GitHub API yetki hatası (403). Token oluştururken "gist" yetkisini işaretlediğinizden emin olun.' };
      }

      if (!response.ok) {
        throw new Error(`GitHub Gist oluşturulamadı (${response.status})`);
      }

      const resData = await response.json();
      const now = new Date().toISOString();
      this.saveSettings({ ...settings, token, gistId: resData.id, lastSyncedAt: now });

      return {
        success: true,
        message: 'Yeni GitHub Gist oluşturuldu ve veriler eşitleme yapıldı!',
        gistId: resData.id,
      };
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
    const token = settings.token?.trim();
    let gistId = settings.gistId?.trim();

    if (!token) {
      return {
        success: false,
        message: 'GitHub Token eksik. Lütfen sağ üstteki Bulut Ayarları penceresinden Token girin.',
      };
    }

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      let response: Response | null = null;

      if (gistId) {
        response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      }

      // Eğer gistId girilmediyse veya girilen gistId 404/bulunamadı ise kullanıcının gists listesini otomatik ara
      if (!response || response.status === 404) {
        const autoGistId = await this.findExistingProjectOSGist(token);
        if (autoGistId) {
          gistId = autoGistId;
          response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
          this.saveSettings({ ...settings, token, gistId });
        }
      }

      if (!response) {
        return {
          success: false,
          message: 'Gist ID belirtilmemiş ve hesabınızda otomatik ProjectOS yedeği bulunamadı. Önce "GitHub\'a Yükle" ile buluta yedek oluşturabilirsiniz.',
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          message: 'GitHub Token geçersiz (401 Unauthorized). Lütfen Personal Access Token bilginizi kontrol edin.',
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: 'GitHub API yetki hatası (403 Forbidden). Token oluştururken "gist" yetkisinin işaretli olduğundan emin olun.',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: 'GitHub Gist bulunamadı (404). Gist silinmiş olabilir veya Token gizli (secret) gisti okuma yetkisine ("gist" scope) sahip olmayabilir.',
        };
      }

      if (!response.ok) {
        throw new Error(`GitHub Gist okunamadı (${response.status})`);
      }

      const resData = await response.json();
      const file = resData.files?.['project_os_data.json'];
      if (!file || !file.content) {
        throw new Error('Gist içinde project_os_data.json dosyası bulunamadı.');
      }

      const parsed = JSON.parse(file.content);
      const now = new Date().toISOString();
      this.saveSettings({ ...settings, token, gistId, lastSyncedAt: now });

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
