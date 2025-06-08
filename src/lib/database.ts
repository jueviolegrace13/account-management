import { supabase } from './supabase';
import { Workspace, Account, Note, Reminder, WorkspaceMember } from '../types';

// Workspace operations
export const createWorkspace = async (name: string) => {
  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWorkspaces = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('User not authenticated');

  const userId = user.id;

  // 1. Workspaces owned by user
  const { data: owned, error: ownedError } = await supabase
    .from('workspaces')
    .select(`
      *,
      workspace_members (*)
    `)
    .eq('owner_id', userId);

  if (ownedError) throw ownedError;

  // 2. Workspaces where user is a member (using the join table)
  const { data: member, error: memberError } = await supabase
    .from('workspaces')
    .select(`
      *,
      workspace_members!inner (*)
    `)
    .eq('workspace_members.user_id', userId);

  if (memberError) throw memberError;

  // 3. Merge & deduplicate by workspace ID
  const combined = [...(owned || []), ...(member || [])];
  const unique = Array.from(new Map(combined.map(ws => [ws.id, ws])).values());

  // 4. Optional: sort by creation date descending
  unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return unique as Workspace[];
};


export const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWorkspace = async (id: string) => {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Workspace member operations
export const inviteWorkspaceMember = async (workspaceId: string, email: string, role: 'owner' | 'assistant') => {
  // First, check if user exists
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) throw new Error('User not found with this email');

  const { data, error } = await supabase
    .from('workspace_members')
    .insert([{
      workspace_id: workspaceId,
      user_id: userData.id,
      role
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeWorkspaceMember = async (workspaceId: string, userId: string) => {
  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw error;
};

// Account operations
export const createAccount = async (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('accounts')
    .insert([account])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWorkspaceAccounts = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select(`
      *,
      notes (
        *,
        author_id
      ),
      reminders (
        *,
        author_id
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Account[];
};

export const getAssignedAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from('accounts')
    .select(`
      *,
      notes (*,
        author:users!notes_author_id_fkey (email)
      ),
      reminders (*,
        author:users!reminders_author_id_fkey (email)
      ),
      workspace:workspaces (name)
    `)
    .contains('assigned_to', [userId])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateAccount = async (id: string, updates: Partial<Account>) => {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAccount = async (id: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Note operations
export const createNote = async (note: Omit<Note, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .single();

  if (error) throw error;
  return data;
};

export const updateNote = async (id: string, updates: Partial<Note>) => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      author:auth.users(email)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reminder operations
export const createReminder = async (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reminders')
    .insert([reminder])
    .single();

  if (error) throw error;
  return data;
};

export const updateReminder = async (id: string, updates: Partial<Reminder>) => {
  const { data, error } = await supabase
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const deleteReminder = async (id: string) => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getUpcomingReminders = async (userId: string) => {
  const { data, error } = await supabase
    .from('reminders')
    .select(`
      *,
      account:accounts (name, workspace_id),
      author:users!reminders_author_id_fkey (email)
    `)
    .eq('author_id', userId)
    .eq('completed', false)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data;
};

// User profile operations
export const createUserProfile = async (user: any) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: user.id,
      email: user.email
    }])
    .select()
    .single();

  if (error && error.code !== '23505') { // Ignore duplicate key error
    throw error;
  }
  return data;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Workspace invitation operations
export const createWorkspaceInvitation = async (
  workspaceId: string,
  email: string,
  role: 'owner' | 'assistant'
) => {
  const { data: invitation, error } = await supabase
    .from('workspace_invitations')
    .insert([{
      workspace_id: workspaceId,
      email,
      role,
      invited_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return invitation;
};

export const acceptWorkspaceInvitation = async (invitationId: string) => {
  const { data: invitation, error: invitationError } = await supabase
    .from('workspace_invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (invitationError) throw invitationError;
  if (invitation.status !== 'pending') throw new Error('Invitation is no longer valid');
  if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitation has expired');

  // Start a transaction
  const { error: transactionError } = await supabase.rpc('accept_workspace_invitation', {
    invitation_id: invitationId
  });

  if (transactionError) throw transactionError;
};

export const getPendingInvitations = async (email: string) => {
  const { data, error } = await supabase
    .from('workspace_invitations')
    .select(`
      *,
      workspaces (
        id,
        name
      )
    `)
    .eq('email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString());

  if (error) throw error;
  return data;
};

// Vault operations
export const getVaultEntries = async (accountId: string) => {
  const { data, error } = await supabase
    .from('vault')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const addVaultEntry = async (accountId: string, key: string, value: string) => {
  const { data, error } = await supabase
    .from('vault')
    .insert([{ account_id: accountId, key, value }])
    .single();
  if (error) throw error;
  return data;
};