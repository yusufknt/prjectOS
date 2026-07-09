import { create } from 'zustand';
import { 
  Project, 
  Task, 
  TimelineItem, 
  GitStatus, 
  TaskStatus, 
  WorkspaceDocument 
} from '../types';
import { storageService, getFilenameFromDocId } from '../services/storage';
import { gitService } from '../services/git';

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  workspaceDocs: WorkspaceDocument[];
  notes: WorkspaceDocument[];
  tasks: Task[];
  timeline: TimelineItem[];
  gitStatuses: Record<string, GitStatus | null>;
  isGitLoading: Record<string, boolean>;
  isCommandPaletteOpen: boolean;

  // Eylemler (Actions)
  loadInitialData: () => Promise<void>;
  selectProject: (id: string | null) => Promise<void>;
  setCommandPaletteOpen: (open: boolean) => void;

  // Proje İşlemleri
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Küresel Not İşlemleri
  addWorkspaceDoc: (doc: Omit<WorkspaceDocument, 'id' | 'updated_at' | 'doc_type' | 'project_id'>) => Promise<void>;
  updateWorkspaceDoc: (id: string, updates: Partial<WorkspaceDocument>) => Promise<void>;
  deleteWorkspaceDoc: (id: string) => Promise<void>;
  renameWorkspaceDoc: (id: string, newTitle: string) => Promise<void>;
  ensureProjectDocs: (projectId: string) => Promise<void>;

  // Görev İşlemleri
  addTask: (task: Omit<Task, 'id' | 'created_at'>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Zaman Akışı
  addTimelineItem: (item: Omit<TimelineItem, 'id' | 'created_at'>) => Promise<void>;

  // Git İşlemleri
  refreshGitStatus: (projectId: string) => Promise<void>;
  refreshAllGitStatuses: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProjectId: null,
  workspaceDocs: [],
  notes: [],
  tasks: [],
  timeline: [],
  gitStatuses: {},
  isGitLoading: {},
  isCommandPaletteOpen: false,

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  loadInitialData: async () => {
    const projects = storageService.getProjects();
    set({ projects });

    if (projects.length > 0) {
      const firstProjectId = projects[0].id;
      set({ selectedProjectId: firstProjectId });

      try {
        let allTasks: Task[] = [];
        let allTimeline: TimelineItem[] = [];

        // 1. Proje Görevleri ve Zaman Akışını oku
        await Promise.all(
          projects.map(async (project) => {
            const [tasks, timeline] = await Promise.all([
              storageService.getProjectTasks(project.local_path),
              storageService.getProjectTimeline(project.local_path),
            ]);
            allTasks = [...allTasks, ...tasks];
            allTimeline = [...allTimeline, ...timeline];
          })
        );

        allTimeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // 2. KÜRESEL NOTLARI oku (Proje bazlı değil, geneldir)
        const globalNotes = await storageService.getGlobalNotes();

        set({
          workspaceDocs: globalNotes,
          notes: globalNotes,
          tasks: allTasks,
          timeline: allTimeline,
        });

        // Git durumunu yenile
        get().refreshGitStatus(firstProjectId);
      } catch (e) {
        console.error("Başlangıç verisi yüklenirken hata:", e);
      }
    }
  },

  selectProject: async (id) => {
    set({ selectedProjectId: id });
    if (!id) return;

    const project = get().projects.find((p) => p.id === id);
    if (project) {
      try {
        get().refreshGitStatus(id);

        const [tasks, timeline] = await Promise.all([
          storageService.getProjectTasks(project.local_path),
          storageService.getProjectTimeline(project.local_path),
        ]);

        set((state) => {
          const otherTasks = state.tasks.filter((t) => t.project_id !== id);
          const otherTimeline = state.timeline.filter((t) => t.project_id !== id);

          const newTimeline = [...timeline, ...otherTimeline].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            tasks: [...tasks, ...otherTasks],
            timeline: newTimeline,
          };
        });
      } catch (e) {
        console.error("Proje yüklenirken hata:", e);
      }
    }
  },

  addProject: async (newProjectData) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const updatedProjects = [newProject, ...get().projects];
    storageService.saveProjects(updatedProjects);

    const timelineItem: TimelineItem = {
      id: `time-${Date.now()}`,
      project_id: newProject.id,
      type: 'status_change',
      content: `Yeni proje eklendi: "${newProject.name}"`,
      created_at: now,
    };

    try {
      await storageService.saveProjectTasks(newProject.local_path, []);
      await storageService.saveProjectTimeline(newProject.local_path, [timelineItem]);

      set((state) => ({
        projects: updatedProjects,
        timeline: [timelineItem, ...state.timeline],
        selectedProjectId: newProject.id,
      }));

      get().refreshGitStatus(newProject.id);
    } catch (e) {
      console.error("Proje eklenirken hata:", e);
    }
  },

  updateProject: (id, updates) => {
    const updatedProjects = get().projects.map((project) =>
      project.id === id
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    );
    storageService.saveProjects(updatedProjects);
    set({ projects: updatedProjects });
  },

  deleteProject: (id) => {
    const updatedProjects = get().projects.filter((p) => p.id !== id);
    storageService.saveProjects(updatedProjects);

    set((state) => {
      const updatedTasks = state.tasks.filter((t) => t.project_id !== id);
      const updatedTimeline = state.timeline.filter((t) => t.project_id !== id);

      return {
        projects: updatedProjects,
        tasks: updatedTasks,
        timeline: updatedTimeline,
        selectedProjectId:
          state.selectedProjectId === id
            ? updatedProjects[0]?.id || null
            : state.selectedProjectId,
      };
    });
  },

  // Küresel Not Ekle
  addWorkspaceDoc: async (docData) => {
    const now = new Date().toISOString();
    let baseTitle = docData.title.trim();
    if (!baseTitle) baseTitle = 'Yeni Not';
    let filename = `${baseTitle.replace(/ /g, '_')}.md`;

    // Dosya adı çakışmasını engelle
    let counter = 1;
    while (get().workspaceDocs.some((d) => d.id === `global-${filename}`)) {
      filename = `${baseTitle.replace(/ /g, '_')}_(${counter}).md`;
      counter++;
    }

    const newDoc: WorkspaceDocument = {
      ...docData,
      project_id: 'global',
      doc_type: 'notes',
      id: `global-${filename}`,
      updated_at: now,
    };

    try {
      await storageService.saveGlobalNote(filename, newDoc.content);

      set((state) => {
        const otherDocs = state.workspaceDocs.filter((d) => d.id !== newDoc.id);
        const nextDocs = [newDoc, ...otherDocs];
        return {
          workspaceDocs: nextDocs,
          notes: nextDocs,
        };
      });
    } catch (e) {
      console.error("Küresel not eklenirken hata:", e);
    }
  },

  // Küresel Not Güncelle
  updateWorkspaceDoc: async (id, updates) => {
    const doc = get().workspaceDocs.find((d) => d.id === id);
    if (!doc) return;

    const now = new Date().toISOString();
    const updatedDoc = { ...doc, ...updates, updated_at: now };

    set((state) => {
      const nextDocs = state.workspaceDocs.map((d) => d.id === id ? updatedDoc : d);
      return { workspaceDocs: nextDocs, notes: nextDocs };
    });

    try {
      const filename = getFilenameFromDocId(id);
      await storageService.saveGlobalNote(filename, updatedDoc.content);
    } catch (e) {
      console.error("Küresel not güncellenirken hata:", e);
    }
  },

  // Küresel Not Yeniden Adlandır
  renameWorkspaceDoc: async (id, newTitle) => {
    const doc = get().workspaceDocs.find((d) => d.id === id);
    if (!doc) return;

    const oldFilename = getFilenameFromDocId(id);
    
    let sanitizedTitle = newTitle.trim().replace(/[^a-zA-Z0-9.\-_ ]/g, '');
    if (!sanitizedTitle) sanitizedTitle = 'Adsiz_Not';
    const newFilename = `${sanitizedTitle.replace(/ /g, '_')}.md`;
    const newId = `global-${newFilename}`;

    try {
      await storageService.renameGlobalNote(oldFilename, newFilename);
      
      set((state) => {
        const nextDocs = state.workspaceDocs.map((d) => {
          if (d.id === id) {
            return {
              ...d,
              id: newId,
              title: newTitle,
              updated_at: new Date().toISOString(),
            };
          }
          return d;
        });

        return { workspaceDocs: nextDocs, notes: nextDocs };
      });
    } catch (e) {
      console.error("Küresel not adı değiştirilirken hata:", e);
    }
  },

  // Küresel Not Sil
  deleteWorkspaceDoc: async (id) => {
    const doc = get().workspaceDocs.find((d) => d.id === id);
    if (!doc) return;

    set((state) => {
      const nextDocs = state.workspaceDocs.filter((d) => d.id !== id);
      return { workspaceDocs: nextDocs, notes: nextDocs };
    });

    try {
      const filename = getFilenameFromDocId(id);
      await storageService.deleteGlobalNote(filename);
    } catch (e) {
      console.error("Küresel not silinirken hata:", e);
    }
  },

  ensureProjectDocs: async () => {
    try {
      const docs = await storageService.getGlobalNotes();
      set({ workspaceDocs: docs, notes: docs });
    } catch (e) {
      console.error("Küresel notlar yüklenirken hata:", e);
    }
  },

  addTask: async (taskData) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_at: now,
    };

    const project = get().projects.find((p) => p.id === taskData.project_id);
    if (project) {
      try {
        const projectTasks = get().tasks.filter((t) => t.project_id === project.id);
        const updatedTasks = [newTask, ...projectTasks];
        await storageService.saveProjectTasks(project.local_path, updatedTasks);

        const timelineItem: TimelineItem = {
          id: `time-${Date.now()}`,
          project_id: taskData.project_id,
          type: 'task_updated',
          content: `Görev oluşturuldu: "${taskData.title}" (${taskData.priority.toUpperCase()})`,
          created_at: now,
        };

        const projectTimeline = get().timeline.filter((t) => t.project_id === project.id);
        const updatedTimeline = [timelineItem, ...projectTimeline];
        await storageService.saveProjectTimeline(project.local_path, updatedTimeline);

        set((state) => {
          const otherTasks = state.tasks.filter((t) => t.project_id !== project.id);
          const otherTimeline = state.timeline.filter((t) => t.project_id !== project.id);
          const nextTimeline = [timelineItem, ...updatedTimeline, ...otherTimeline].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            tasks: [...updatedTasks, ...otherTasks],
            timeline: nextTimeline,
          };
        });
      } catch (e) {
        console.error("Görev eklenirken hata:", e);
      }
    }
  },

  updateTaskStatus: async (id, status) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const project = get().projects.find((p) => p.id === task.project_id);
    if (!project) return;

    const updatedTask = { ...task, status };

    try {
      const projectTasks = get().tasks.filter((t) => t.project_id === project.id);
      const updatedTasks = projectTasks.map((t) => t.id === id ? updatedTask : t);
      await storageService.saveProjectTasks(project.local_path, updatedTasks);

      const timelineItem: TimelineItem = {
        id: `time-${Date.now()}`,
        project_id: task.project_id,
        type: 'task_updated',
        content: `Görev durumu güncellendi: "${task.title}" -> ${status.toUpperCase()}`,
        created_at: new Date().toISOString(),
      };

      const projectTimeline = get().timeline.filter((t) => t.project_id === project.id);
      const updatedTimeline = [timelineItem, ...projectTimeline];
      await storageService.saveProjectTimeline(project.local_path, updatedTimeline);

      set((state) => {
        const otherTasks = state.tasks.filter((t) => t.project_id !== project.id);
        const otherTimeline = state.timeline.filter((t) => t.project_id !== project.id);
        const nextTimeline = [timelineItem, ...updatedTimeline, ...otherTimeline].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return {
          tasks: [...updatedTasks, ...otherTasks],
          timeline: nextTimeline,
        };
      });
    } catch (e) {
      console.error("Görev güncellenirken hata:", e);
    }
  },

  deleteTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const project = get().projects.find((p) => p.id === task.project_id);
    if (!project) return;

    try {
      const projectTasks = get().tasks.filter((t) => t.project_id === project.id);
      const updatedTasks = projectTasks.filter((t) => t.id !== id);
      await storageService.saveProjectTasks(project.local_path, updatedTasks);

      set((state) => {
        const otherTasks = state.tasks.filter((t) => t.project_id !== project.id);
        return {
          tasks: [...updatedTasks, ...otherTasks],
        };
      });
    } catch (e) {
      console.error("Görev silinirken hata:", e);
    }
  },

  addTimelineItem: async (itemData) => {
    const project = get().projects.find((p) => p.id === itemData.project_id);
    if (!project) return;

    const newItem: TimelineItem = {
      ...itemData,
      id: `time-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const projectTimeline = get().timeline.filter((t) => t.project_id === project.id);
      const updatedTimeline = [newItem, ...projectTimeline];
      await storageService.saveProjectTimeline(project.local_path, updatedTimeline);

      set((state) => {
        const otherTimeline = state.timeline.filter((t) => t.project_id !== project.id);
        const nextTimeline = [newItem, ...state.timeline].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { timeline: nextTimeline };
      });
    } catch (e) {
      console.error("Zaman akışı eklenirken hata:", e);
    }
  },

  refreshGitStatus: async (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;

    set((state) => ({
      isGitLoading: { ...state.isGitLoading, [projectId]: true },
    }));

    try {
      const status = await gitService.getGitStatus(project.id, project.local_path);
      set((state) => ({
        gitStatuses: { ...state.gitStatuses, [projectId]: status },
        isGitLoading: { ...state.isGitLoading, [projectId]: false },
      }));
    } catch (error) {
      set((state) => ({
        gitStatuses: { ...state.gitStatuses, [projectId]: null },
        isGitLoading: { ...state.isGitLoading, [projectId]: false },
      }));
    }
  },

  refreshAllGitStatuses: async () => {
    const projects = get().projects;
    for (const project of projects) {
      await get().refreshGitStatus(project.id);
    }
  },
}));
