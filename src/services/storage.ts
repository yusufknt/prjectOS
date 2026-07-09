import { invoke } from '@tauri-apps/api/core';
import { 
  Project, 
  Task, 
  TimelineItem, 
  WorkspaceDocument 
} from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'project_os_v2_projects',
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'ProjectOS Masaüstü Yönetim',
    description: 'Tauri 2, React 19 ve Dosya Tabanlı (File-Based Workspace) geliştirici yönetim uygulaması.',
    local_path: 'C:\\Users\\yusuf\\Desktop\\projectOS',
    repository: 'https://github.com/yusufknt/prjectOS.git',
    status: 'active',
    progress: 85,
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-07-09T16:30:00Z',
  },
];

export const getFilenameFromDocId = (docId: string): string => {
  // id formatı: doc-${projectId}-${filename} veya global-${filename}
  const parts = docId.split('-');
  // Son kısmı al (filename.md)
  return parts[parts.length - 1];
};

export const storageService = {
  // Proje listesi tarayıcıda bilgisayara özel kalır (Klasör yolları değişeceği için)
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(data);
  },

  saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Projeye özel Görevleri (Tasks) oku
  async getProjectTasks(projectPath: string): Promise<Task[]> {
    try {
      const exists = await invoke<boolean>('project_file_exists', { projectPath, filename: 'tasks.json' });
      if (!exists) {
        return [];
      }
      const data = await invoke<string>('read_project_file', { projectPath, filename: 'tasks.json' });
      return JSON.parse(data);
    } catch (e) {
      console.error('Görevler okunurken hata:', e);
      return [];
    }
  },

  // Projeye özel Görevleri (Tasks) kaydet
  async saveProjectTasks(projectPath: string, tasks: Task[]): Promise<void> {
    try {
      const content = JSON.stringify(tasks, null, 2);
      await invoke('write_project_file', { projectPath, filename: 'tasks.json', content });
    } catch (e) {
      console.error('Görevler kaydedilirken hata:', e);
    }
  },

  // Projeye özel Zaman Akışını (Timeline) oku
  async getProjectTimeline(projectPath: string): Promise<TimelineItem[]> {
    try {
      const exists = await invoke<boolean>('project_file_exists', { projectPath, filename: 'timeline.json' });
      if (!exists) {
        return [];
      }
      const data = await invoke<string>('read_project_file', { projectPath, filename: 'timeline.json' });
      return JSON.parse(data);
    } catch (e) {
      console.error('Zaman akışı okunurken hata:', e);
      return [];
    }
  },

  // Projeye özel Zaman Akışını (Timeline) kaydet
  async saveProjectTimeline(projectPath: string, timeline: TimelineItem[]): Promise<void> {
    try {
      const content = JSON.stringify(timeline, null, 2);
      await invoke('write_project_file', { projectPath, filename: 'timeline.json', content });
    } catch (e) {
      console.error('Zaman akışı kaydedilirken hata:', e);
    }
  },

  // ==========================================
  // KÜRESEL NOT YÖNETİMİ (GLOBAL STORAGE)
  // ==========================================
  async getGlobalNotes(): Promise<WorkspaceDocument[]> {
    const docs: WorkspaceDocument[] = [];
    try {
      let files = await invoke<string[]>('list_global_notes');
      
      // Eğer hiç küresel not yoksa varsayılan bir adet 'Notlar.md' oluştur
      if (files.length === 0) {
        const defaultFilename = 'Notlar.md';
        const defaultContent = `# Genel Notlar\n\nApple Notlar tarzı sadeleştirilmiş küresel not defteri.\nBuraya yazdığınız notlar tüm projelerde ortak olarak gösterilecektir.\nGitHub ile senkronize olur.`;
        await invoke('write_global_note', { filename: defaultFilename, content: defaultContent });
        files = [defaultFilename];
      }

      for (const filename of files) {
        const content = await invoke<string>('read_global_note', { filename });
        const title = filename.replace('.md', '').replace(/_/g, ' ');

        docs.push({
          id: `global-${filename}`,
          project_id: 'global', // Projeden bağımsız küresel kimlik
          doc_type: 'notes',
          title,
          content,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Küresel notlar okunurken hata:', e);
    }
    return docs;
  },

  async saveGlobalNote(filename: string, content: string): Promise<void> {
    try {
      await invoke('write_global_note', { filename, content });
    } catch (e) {
      console.error(`${filename} kaydedilirken hata:`, e);
    }
  },

  async deleteGlobalNote(filename: string): Promise<void> {
    try {
      await invoke('delete_global_note', { filename });
    } catch (e) {
      console.error(`${filename} silinirken hata:`, e);
    }
  },

  async renameGlobalNote(oldFilename: string, newFilename: string): Promise<void> {
    try {
      await invoke('rename_global_note', { oldFilename, newFilename });
    } catch (e) {
      console.error(`${oldFilename} yeniden adlandırılırken hata:`, e);
    }
  },
};
