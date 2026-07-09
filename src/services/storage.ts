import { invoke } from '@tauri-apps/api/core';
import { 
  Project, 
  Task, 
  TimelineItem, 
  WorkspaceDocument 
} from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'project_os_v2_projects',
  TASKS_PREFIX: 'project_os_v2_tasks_',
  TIMELINE_PREFIX: 'project_os_v2_timeline_',
  GLOBAL_NOTES: 'project_os_v2_global_notes',
};

const isTauri = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'ProjectOS Masaüstü',
    description: 'En son: GitHub bulut eşitleme (Cloud Sync) ve sade Apple arayüzü eklendi.',
    pushed: true,
    repository: 'https://github.com/yusufknt/prjectOS.git',
    status: 'active',
    created_at: '2026-07-01T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    project_id: 'proj-1',
    title: 'Tauri 2 ve React 19 mimarisini kur',
    description: 'Hibrit depolama yapısı ve IPC bağlantılarının hazırlanması',
    status: 'done',
    priority: 'high',
    created_at: '2026-07-01T10:00:00Z',
  },
  {
    id: 'task-102',
    project_id: 'proj-1',
    title: 'Kanban ve Görev Panosu entegrasyonu',
    description: 'Sürükle bırak görev yönetimi ve öncelik etiketleri',
    status: 'in_progress',
    priority: 'medium',
    created_at: '2026-07-05T14:30:00Z',
  },
  {
    id: 'task-103',
    project_id: 'proj-1',
    title: 'Küresel Notlar ve Markdown editörü',
    description: 'Apple Notlar tarzı anlık kayıt ve Markdown önizleme',
    status: 'todo',
    priority: 'low',
    created_at: '2026-07-08T09:15:00Z',
  },
];

const INITIAL_TIMELINE: TimelineItem[] = [
  {
    id: 'time-101',
    project_id: 'proj-1',
    type: 'git_commit',
    content: 'feat: Tarayıcı ve masaüstü hibrit depolama (localStorage + Tauri) eklendi',
    created_at: new Date().toISOString(),
  },
  {
    id: 'time-102',
    project_id: 'proj-1',
    type: 'task_updated',
    content: 'Görev durumu güncellendi: "Tauri 2 ve React 19 mimarisini kur" -> DONE',
    created_at: '2026-07-08T16:20:00Z',
  },
  {
    id: 'time-103',
    project_id: 'proj-1',
    type: 'note_created',
    content: 'Yeni not eklendi: "Proje Mimari Kararları.md"',
    created_at: '2026-07-07T11:45:00Z',
  },
];

const INITIAL_NOTES: WorkspaceDocument[] = [
  {
    id: 'global-Notlar.md',
    project_id: 'global',
    doc_type: 'notes',
    title: 'Notlar',
    content: `# Genel Notlar\n\nApple Notlar tarzı sadeleştirilmiş küresel not defteri.\nBuraya yazdığınız notlar tüm projelerde ortak olarak gösterilecektir ve tarayıcı yenilense dahi silinmez.\n\n- Hibrit Çalışma Modu (Tarayıcı & Masaüstü)\n- Otomatik Kayıt & Sayfa Yenileme Koruması`,
    updated_at: new Date().toISOString(),
  },
];

export const getFilenameFromDocId = (docId: string): string => {
  const parts = docId.split('-');
  return parts[parts.length - 1];
};

export const storageService = {
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects: Project[]) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  async getProjectTasks(projectPath: string): Promise<Task[]> {
    const key = STORAGE_KEYS.TASKS_PREFIX + projectPath;
    if (isTauri()) {
      try {
        const exists = await invoke<boolean>('project_file_exists', { projectPath, filename: 'tasks.json' });
        if (exists) {
          const data = await invoke<string>('read_project_file', { projectPath, filename: 'tasks.json' });
          const parsed = JSON.parse(data);
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {
        console.warn('Tauri tasks oku uyarısı (fallback kullanılıyor):', e);
      }
    }

    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch {
        // Hatalı JSON durumunda varsayılana dön
      }
    }

    // İlk projeyse başlangıç görevlerini yükle ve kaydet
    if (projectPath.includes('projectOS') || projectPath === INITIAL_PROJECTS[0].local_path) {
      localStorage.setItem(key, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return [];
  },

  async saveProjectTasks(projectPath: string, tasks: Task[]): Promise<void> {
    const key = STORAGE_KEYS.TASKS_PREFIX + projectPath;
    localStorage.setItem(key, JSON.stringify(tasks));

    if (isTauri()) {
      try {
        const content = JSON.stringify(tasks, null, 2);
        await invoke('write_project_file', { projectPath, filename: 'tasks.json', content });
      } catch (e) {
        console.warn('Tauri tasks kayıt uyarısı:', e);
      }
    }
  },

  async getProjectTimeline(projectPath: string): Promise<TimelineItem[]> {
    const key = STORAGE_KEYS.TIMELINE_PREFIX + projectPath;
    if (isTauri()) {
      try {
        const exists = await invoke<boolean>('project_file_exists', { projectPath, filename: 'timeline.json' });
        if (exists) {
          const data = await invoke<string>('read_project_file', { projectPath, filename: 'timeline.json' });
          const parsed = JSON.parse(data);
          localStorage.setItem(key, JSON.stringify(parsed));
          return parsed;
        }
      } catch (e) {
        console.warn('Tauri timeline oku uyarısı (fallback kullanılıyor):', e);
      }
    }

    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch {
        // Hatalı JSON
      }
    }

    if (projectPath.includes('projectOS') || projectPath === INITIAL_PROJECTS[0].local_path) {
      localStorage.setItem(key, JSON.stringify(INITIAL_TIMELINE));
      return INITIAL_TIMELINE;
    }
    return [];
  },

  async saveProjectTimeline(projectPath: string, timeline: TimelineItem[]): Promise<void> {
    const key = STORAGE_KEYS.TIMELINE_PREFIX + projectPath;
    localStorage.setItem(key, JSON.stringify(timeline));

    if (isTauri()) {
      try {
        const content = JSON.stringify(timeline, null, 2);
        await invoke('write_project_file', { projectPath, filename: 'timeline.json', content });
      } catch (e) {
        console.warn('Tauri timeline kayıt uyarısı:', e);
      }
    }
  },

  async getGlobalNotes(): Promise<WorkspaceDocument[]> {
    if (isTauri()) {
      try {
        const docs: WorkspaceDocument[] = [];
        let files = await invoke<string[]>('list_global_notes');
        if (files.length === 0) {
          const defaultFilename = 'Notlar.md';
          const defaultContent = INITIAL_NOTES[0].content;
          await invoke('write_global_note', { filename: defaultFilename, content: defaultContent });
          files = [defaultFilename];
        }

        for (const filename of files) {
          const content = await invoke<string>('read_global_note', { filename });
          const title = filename.replace('.md', '').replace(/_/g, ' ');

          docs.push({
            id: `global-${filename}`,
            project_id: 'global',
            doc_type: 'notes',
            title,
            content,
            updated_at: new Date().toISOString(),
          });
        }
        localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(docs));
        return docs;
      } catch (e) {
        console.warn('Tauri küresel notlar okuma uyarısı:', e);
      }
    }

    const localData = localStorage.getItem(STORAGE_KEYS.GLOBAL_NOTES);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // Hatalı JSON
      }
    }

    localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(INITIAL_NOTES));
    return INITIAL_NOTES;
  },

  async saveGlobalNote(filename: string, content: string): Promise<void> {
    const localData = localStorage.getItem(STORAGE_KEYS.GLOBAL_NOTES);
    let notes: WorkspaceDocument[] = [];
    if (localData) {
      try { notes = JSON.parse(localData); } catch {}
    }

    const title = filename.replace('.md', '').replace(/_/g, ' ');
    const id = `global-${filename}`;
    const now = new Date().toISOString();
    const existingIndex = notes.findIndex((n) => n.id === id);

    if (existingIndex >= 0) {
      notes[existingIndex] = { ...notes[existingIndex], title, content, updated_at: now };
    } else {
      notes.unshift({ id, project_id: 'global', doc_type: 'notes', title, content, updated_at: now });
    }
    localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(notes));

    if (isTauri()) {
      try {
        await invoke('write_global_note', { filename, content });
      } catch (e) {
        console.warn(`${filename} Tauri kayıt uyarısı:`, e);
      }
    }
  },

  async saveAllGlobalNotes(notes: WorkspaceDocument[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(notes));

    if (isTauri()) {
      for (const note of notes) {
        const filename = getFilenameFromDocId(note.id) || `${note.title}.md`;
        try {
          await invoke('write_global_note', { filename, content: note.content });
        } catch (e) {
          console.warn(`Tauri küresel not senkron kayıt uyarısı (${filename}):`, e);
        }
      }
    }
  },

  async deleteGlobalNote(filename: string): Promise<void> {
    const id = `global-${filename}`;
    const localData = localStorage.getItem(STORAGE_KEYS.GLOBAL_NOTES);
    if (localData) {
      try {
        let notes: WorkspaceDocument[] = JSON.parse(localData);
        notes = notes.filter((n) => n.id !== id);
        localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(notes));
      } catch {}
    }

    if (isTauri()) {
      try {
        await invoke('delete_global_note', { filename });
      } catch (e) {
        console.warn(`${filename} Tauri silme uyarısı:`, e);
      }
    }
  },

  async renameGlobalNote(oldFilename: string, newFilename: string): Promise<void> {
    const oldId = `global-${oldFilename}`;
    const newId = `global-${newFilename}`;
    const newTitle = newFilename.replace('.md', '').replace(/_/g, ' ');

    const localData = localStorage.getItem(STORAGE_KEYS.GLOBAL_NOTES);
    if (localData) {
      try {
        let notes: WorkspaceDocument[] = JSON.parse(localData);
        notes = notes.map((n) => n.id === oldId ? { ...n, id: newId, title: newTitle, updated_at: new Date().toISOString() } : n);
        localStorage.setItem(STORAGE_KEYS.GLOBAL_NOTES, JSON.stringify(notes));
      } catch {}
    }

    if (isTauri()) {
      try {
        await invoke('rename_global_note', { oldFilename, newFilename });
      } catch (e) {
        console.warn(`${oldFilename} Tauri yeniden adlandırma uyarısı:`, e);
      }
    }
  },
};

