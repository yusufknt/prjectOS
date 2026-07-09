import { invoke } from '@tauri-apps/api/core';
import { 
  Project, 
  Task, 
  TimelineItem, 
  WorkspaceDocument, 
  WorkspaceDocumentType 
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
    repository: 'https://github.com/yusuf/project-os',
    status: 'active',
    progress: 85,
    created_at: '2026-07-01T10:00:00Z',
    updated_at: '2026-07-09T16:30:00Z',
  },
];

function getDocTitle(filename: string): string {
  switch (filename) {
    case 'notes.md': return 'Genel Geliştirme Notları (notes.md)';
    case 'architecture.md': return 'Sistem Mimarisi (architecture.md)';
    case 'decisions.md': return 'Mimari Karar Kayıtları (decisions.md)';
    case 'ideas.md': return 'Gelecek Fikirler ve İlhamlar (ideas.md)';
    default: {
      const base = filename.replace('.md', '');
      return `${base} (${filename})`;
    }
  }
}

function getDocType(filename: string): WorkspaceDocumentType {
  switch (filename) {
    case 'notes.md': return 'notes';
    case 'architecture.md': return 'architecture';
    case 'decisions.md': return 'decisions';
    case 'ideas.md': return 'ideas';
    default: return 'notes'; // Varsayılan olarak notlar kategorisinde gösterilir
  }
}

function getDefaultDocContent(projectName: string, docType: WorkspaceDocumentType): string {
  const now = new Date().toLocaleDateString('tr-TR');
  switch (docType) {
    case 'notes':
      return `# ${projectName} — Geliştirme Notları\n\nBu dosya projenizin günlük geliştirme notları için tasarlanmıştır.`;
    case 'architecture':
      return `# ${projectName} — Mimari Tasarım\n\nKullanılan kütüphaneler, katmanlar ve akış şemalarını buraya ekleyebilirsiniz.`;
    case 'decisions':
      return `# ${projectName} — Karar Kayıtları (ADR)\n\n## Karar #001: Başlangıç Teknoloji Yığını\n- Tarih: ${now}\n- Durum: Kabul Edildi ✅`;
    case 'ideas':
      return `# ${projectName} — Fikirler & Yol Haritası\n\n- Gelecekte eklenebilecek özellikler ve ilhamlar.`;
  }
}

export const getFilenameFromDocId = (docId: string): string => {
  if (docId.includes('.md')) {
    const parts = docId.split('-');
    return parts[parts.length - 1];
  }
  const parts = docId.split('-');
  const suffix = parts[parts.length - 1];
  switch (suffix) {
    case 'notes': return 'notes.md';
    case 'arch':
    case 'architecture': return 'architecture.md';
    case 'decisions': return 'decisions.md';
    case 'ideas': return 'ideas.md';
    default: return `${suffix}.md`;
  }
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

  // Projeye özel Dokümanları (bütün .md dosyalarını) oku/oluştur
  async getProjectDocs(projectId: string, projectPath: string, projectName: string): Promise<WorkspaceDocument[]> {
    const defaultFilenames = ['notes.md', 'architecture.md', 'decisions.md', 'ideas.md'];
    const docs: WorkspaceDocument[] = [];

    try {
      // Önce klasördeki tüm .md dosyalarını listele
      let mdFiles = await invoke<string[]>('list_project_md_files', { projectPath });
      
      // Eğer varsayılan dosyalar henüz oluşmamışsa, listeye ekle (döngüde otomatik oluşturulacaklar)
      defaultFilenames.forEach(file => {
        if (!mdFiles.includes(file)) {
          mdFiles.push(file);
        }
      });

      for (const filename of mdFiles) {
        const exists = await invoke<boolean>('project_file_exists', { projectPath, filename });
        let content = '';

        if (!exists) {
          const docType = getDocType(filename);
          content = getDefaultDocContent(projectName, docType);
          await invoke('write_project_file', { projectPath, filename, content });
        } else {
          content = await invoke<string>('read_project_file', { projectPath, filename });
        }

        docs.push({
          id: `doc-${projectId}-${filename}`,
          project_id: projectId,
          doc_type: getDocType(filename),
          title: getDocTitle(filename),
          content,
          updated_at: new Date().toISOString(),
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
};
