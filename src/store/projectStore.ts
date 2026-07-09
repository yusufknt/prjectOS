import { create } from 'zustand';
import { 
  Project, 
  Task, 
  TimelineItem, 
  GitStatus, 
  TaskStatus, 
  WorkspaceDocument,
  WorkspaceDocumentType 
} from '../types';
import { storageService, getFilenameFromDocId } from '../services/storage';
import { gitService } from '../services/git';

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  workspaceDocs: WorkspaceDocument[];
  notes: WorkspaceDocument[]; // Geriye dönük uyumluluk alias
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

  // Geliştirici Çalışma Alanı Dokümanları
  addWorkspaceDoc: (doc: Omit<WorkspaceDocument, 'id' | 'updated_at'>) => Promise<void>;
  updateWorkspaceDoc: (id: string, updates: Partial<WorkspaceDocument>) => Promise<void>;
  deleteWorkspaceDoc: (id: string) => Promise<void>;
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
        let allDocs: WorkspaceDocument[] = [];

        await Promise.all(
          projects.map(async (project) => {
            const [tasks, timeline, docs] = await Promise.all([
              storageService.getProjectTasks(project.local_path),
              storageService.getProjectTimeline(project.local_path),
              storageService.getProjectDocs(project.id, project.local_path, project.name),
            ]);
            allTasks = [...allTasks, ...tasks];
            allTimeline = [...allTimeline, ...timeline];
            allDocs = [...allDocs, ...docs];
          })
        );

        allTimeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        set({
          workspaceDocs: allDocs,
          notes: allDocs,
          tasks: allTasks,
          timeline: allTimeline,
        });

        // Git durumunu oku
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

        const [docs, tasks, timeline] = await Promise.all([
          storageService.getProjectDocs(project.id, project.local_path, project.name),
          storageService.getProjectTasks(project.local_path),
          storageService.getProjectTimeline(project.local_path),
        ]);

        set((state) => {
          const otherDocs = state.workspaceDocs.filter((d) => d.project_id !== id);
          const otherTasks = state.tasks.filter((t) => t.project_id !== id);
          const otherTimeline = state.timeline.filter((t) => t.project_id !== id);

          const newDocs = [...docs, ...otherDocs];
          const newTimeline = [...timeline, ...otherTimeline].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            workspaceDocs: newDocs,
            notes: newDocs,
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
      content: `Yeni proje ve dosya tabanlı çalışma alanı oluşturuldu: "${newProject.name}"`,
      created_at: now,
    };

    try {
      const defaultDocs = await storageService.getProjectDocs(newProject.id, newProject.local_path, newProject.name);
      await storageService.saveProjectTasks(newProject.local_path, []);
      await storageService.saveProjectTimeline(newProject.local_path, [timelineItem]);

      set((state) => ({
        projects: updatedProjects,
        workspaceDocs: [...defaultDocs, ...state.workspaceDocs],
        notes: [...defaultDocs, ...state.workspaceDocs],
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
      const updatedDocs = state.workspaceDocs.filter((d) => d.project_id !== id);
      const updatedTasks = state.tasks.filter((t) => t.project_id !== id);
      const updatedTimeline = state.timeline.filter((t) => t.project_id !== id);

      return {
        projects: updatedProjects,
        workspaceDocs: updatedDocs,
        notes: updatedDocs,
        tasks: updatedTasks,
        timeline: updatedTimeline,
        selectedProjectId:
          state.selectedProjectId === id
            ? updatedProjects[0]?.id || null
            : state.selectedProjectId,
      };
    });
  },

  addWorkspaceDoc: async (docData) => {
    const now = new Date().toISOString();
    const filename = docData.title.endsWith('.md') ? docData.title : `${docData.title}.md`;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const newDoc: WorkspaceDocument = {
      ...docData,
      id: `doc-${docData.project_id}-${sanitizedFilename}`,
      updated_at: now,
    };

    const project = get().projects.find((p) => p.id === docData.project_id);
    if (project) {
      try {
        await storageService.saveProjectDoc(project.local_path, sanitizedFilename, newDoc.content);

        const timelineItem: TimelineItem = {
          id: `time-${Date.now()}`,
          project_id: docData.project_id,
          type: 'note_created',
          content: `Çalışma alanı dosyası eklendi: "${docData.title}"`,
          created_at: now,
        };

        const projectTimeline = get().timeline.filter((t) => t.project_id === project.id);
        const updatedTimeline = [timelineItem, ...projectTimeline];
        await storageService.saveProjectTimeline(project.local_path, updatedTimeline);

        set((state) => {
          const otherDocs = state.workspaceDocs.filter((d) => d.id !== newDoc.id);
          const nextDocs = [newDoc, ...otherDocs];

          const otherTimeline = state.timeline.filter((t) => t.project_id !== project.id);
          const nextTimeline = [timelineItem, ...otherTimeline, ...state.timeline].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return {
            workspaceDocs: nextDocs,
            notes: nextDocs,
            timeline: nextTimeline,
          };
        });
      } catch (e) {
        console.error("Doküman eklenirken hata:", e);
      }
    }
  },

  updateWorkspaceDoc: async (id, updates) => {
    const doc = get().workspaceDocs.find((d) => d.id === id);
    if (!doc) return;

    const project = get().projects.find((p) => p.id === doc.project_id);
    if (!project) return;

    const now = new Date().toISOString();
    const updatedDoc = { ...doc, ...updates, updated_at: now };

    set((state) => {
      const nextDocs = state.workspaceDocs.map((d) => d.id === id ? updatedDoc : d);
      return { workspaceDocs: nextDocs, notes: nextDocs };
    });

    try {
      const filename = getFilenameFromDocId(id);
      await storageService.saveProjectDoc(project.local_path, filename, updatedDoc.content);
    } catch (e) {
      console.error("Doküman güncellenirken hata:", e);
    }
  },

  deleteWorkspaceDoc: async (id) => {
    const doc = get().workspaceDocs.find((d) => d.id === id);
    if (!doc) return;

    const project = get().projects.find((p) => p.id === doc.project_id);
    if (!project) return;

    set((state) => {
      const nextDocs = state.workspaceDocs.filter((d) => d.id !== id);
      return { workspaceDocs: nextDocs, notes: nextDocs };
    });

    try {
      const filename = getFilenameFromDocId(id);
      await storageService.deleteProjectDoc(project.local_path, filename);
    } catch (e) {
      console.error("Doküman silinirken hata:", e);
    }
  },

  ensureProjectDocs: async (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    try {
      const docs = await storageService.getProjectDocs(project.id, project.local_path, project.name);
      set((state) => {
        const otherDocs = state.workspaceDocs.filter((d) => d.project_id !== projectId);
        const newDocs = [...docs, ...otherDocs];
        return { workspaceDocs: newDocs, notes: newDocs };
      });
    } catch (e) {
      console.error("Dosyalar kontrol edilirken hata:", e);
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
