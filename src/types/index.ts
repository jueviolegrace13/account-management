export type NoteType = 'regular' | 'report';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  username: string;
  website: string;
  notes: Note[];
  assistantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  content: string;
  date: string;
  completed: boolean;
  accountId?: string;
  createdAt: string;
}

export interface Assistant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountIds: string[];
  createdAt: string;
}

export interface User {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
}