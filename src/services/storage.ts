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
  // id formatı: doc-${projectId}-${filename}
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

  // Projeye özel Dokümanları (.md dosyalarını) oku/oluştur
  async getProjectDocs(projectId: string, projectPath: string, projectName: string): Promise<WorkspaceDocument[]> {
    const docs: WorkspaceDocument[] = [];

    try {
      // Klasördeki .md dosyalarını listele
      let mdFiles = await invoke<string[]>('list_project_md_files', { projectPath });
      
      // Eğer hiç markdown dosyası yoksa varsayılan bir adet 'Notlar.md' oluştur
      if (mdFiles.length === 0) {
        const defaultFilename = 'Notlar.md';
        const defaultContent = `# ${projectName} Notları\n\n- Apple Notlar tarzı sadeleştirilmiş not sistemi.\n- Yeni notlar ekleyebilir, başlıklarını ve içeriklerini düzenleyebilirsiniz.`;
        await invoke('write_project_file', { projectPath, filename: defaultFilename, content: defaultContent });
        mdFiles = [defaultFilename];
      }

      for (const filename of mdFiles) {
        const content = await invoke<string>('read_project_file', { projectPath, filename });
        const title = filename.replace('.md', '').replace(/_/g, ' ');

        docs.push({
          id: `doc-${projectId}-${filename}`,
          project_id: projectId,
          doc_type: 'notes', // Sadeleştirilmiş olarak hepsi 'notes'
          title,
          content,
          updated_at: new Date().toISOString(), // Gerçek zamanlı okunduğu için timestamp
        });
      }
    } catch (e) {
      console.error('Dokümanlar listelenirken hata:', e);
    }

    return docs;
  },

  // Projeye özel Dokümanı (Markdown dosyası) kaydet
  async saveProjectDoc(projectPath: string, filename: string, content: string): Promise<void> {
    try {
      await invoke('write_project_file', { projectPath, filename, content });
    } catch (e) {
      console.error(`${filename} kaydedilirken hata:`, e);
    }
  },

  // Projeye özel Dokümanı (Markdown dosyası) sil
  async deleteProjectDoc(projectPath: string, filename: string): Promise<void> {
    try {
      await invoke('delete_project_file', { projectPath, filename });
    } catch (e) {
      console.error(`${filename} silinirken hata:`, e);
    }
  },

  // Projeye özel Dokümanı (Markdown dosyası) yeniden adlandır
  async renameProjectDoc(projectPath: string, oldFilename: string, newFilename: string): Promise<void> {
    try {
      await invoke('rename_project_file', { projectPath, oldFilename, newFilename });
    } catch (e) {
      console.error('Dosya yeniden adlandırılamadı:', e);
    }
  },
};
