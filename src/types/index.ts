export type NoteType = 'regular' | 'report';
export type WorkspaceRole = 'owner' | 'assistant';

export interface User {
  id: string;
  email: string;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
}

export interface Account {
  id: string;
  workspaceId: string;
  name: string;
  username: string;
  website: string;
  assignedTo: string[];
  notes: Note[];
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  accountId: string;
  authorId: string;
  title: string;
  content: string;
  type: NoteType;
  createdAt: string;
}

export interface Reminder {
  id: string;
  accountId: string;
  authorId: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  createdAt: string;
}