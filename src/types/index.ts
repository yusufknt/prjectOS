export type ProjectStatus = 'active' | 'pending' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  local_path?: string;
  repository?: string;
  pushed?: boolean;
  status: ProjectStatus;
  progress?: number;
  created_at: string;
  updated_at: string;
}

export interface CloudSyncSettings {
  token?: string;
  gistId?: string;
  lastSyncedAt?: string;
}

export type WorkspaceDocumentType = 'notes' | 'architecture' | 'decisions' | 'ideas';

export interface WorkspaceDocument {
  id: string;
  project_id: string;
  doc_type: WorkspaceDocumentType;
  title: string;
  content: string;
  updated_at: string;
}

export type Note = WorkspaceDocument;

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
}

export type TimelineEventType = 'git_commit' | 'note_created' | 'task_updated' | 'status_change';

export interface TimelineItem {
  id: string;
  project_id: string;
  type: TimelineEventType;
  content: string;
  created_at: string;
}

export interface GitStatus {
  branch: string;
  lastCommitMessage: string;
  lastCommitTime: string;
  lastPushTime: string;
  remoteUrl: string;
  modifiedFiles: number;
  stagedFiles: number;
  untrackedFiles: number;
  ahead: number;
  behind: number;
  lastUpdated: string;
}
