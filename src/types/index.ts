export type NoteType = 'regular' | 'report';
export type WorkspaceRole = 'owner' | 'assistant';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  workspace_members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
  user?: {
    email: string;
  };
}

export interface Account {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  username: string;
  website?: string;
  assigned_to: string[];
  created_at: string;
  updated_at: string;
  notes?: Note[];
  reminders?: Reminder[];
}

export interface Note {
  id: string;
  account_id: string;
  author_id: string;
  title: string;
  content: string;
  type: NoteType;
  created_at: string;
  author?: {
    email: string;
  };
}

export interface Reminder {
  id: string;
  user_id: string;
  account_id: string;
  workspace_id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  created_at: string;
  author_id?: string;
  author?: {
    email: string;
  };
}

export interface UserSettings {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  timezone: string;
}