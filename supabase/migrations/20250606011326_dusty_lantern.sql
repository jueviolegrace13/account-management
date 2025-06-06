/*
  # Workspace and Permission Updates

  1. New Tables
    - `workspaces`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key to users)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workspace_members`
      - `workspace_id` (uuid, foreign key to workspaces)
      - `user_id` (uuid, foreign key to users)
      - `role` (text) - 'owner' or 'assistant'
      - `created_at` (timestamp)

  2. Modified Tables
    - Move accounts to be under workspaces
    - Move notes and reminders to be under accounts
    - Update RLS policies for workspace-based access

  3. Security
    - Enable RLS on new tables
    - Add policies for workspace access
*/

-- Create workspaces table
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'assistant')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Modify accounts table to be under workspaces
ALTER TABLE public.accounts 
  DROP CONSTRAINT accounts_user_id_fkey,
  ADD COLUMN workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  ADD COLUMN assigned_to uuid[] DEFAULT '{}';

-- Move notes under accounts directly
ALTER TABLE public.notes
  DROP CONSTRAINT notes_account_id_fkey,
  ADD COLUMN author_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- Move reminders under accounts
ALTER TABLE public.reminders
  DROP CONSTRAINT reminders_user_id_fkey,
  DROP CONSTRAINT reminders_account_id_fkey,
  ADD COLUMN author_id uuid REFERENCES auth.users ON DELETE CASCADE,
  ALTER COLUMN account_id SET NOT NULL;

-- Drop unnecessary tables
DROP TABLE public.account_assistants;
DROP TABLE public.assistants;

-- Enable RLS on new tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
    OR owner_id = auth.uid()
  );

CREATE POLICY "Owners can manage their workspaces"
  ON public.workspaces
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create policies for workspace members
CREATE POLICY "Users can view workspace members where they are members"
  ON public.workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Update account policies
CREATE POLICY "Users can view accounts in their workspaces"
  ON public.accounts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = accounts.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = accounts.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage accounts"
  ON public.accounts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = accounts.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = accounts.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Update note policies
CREATE POLICY "Users can view notes for accounts they have access to"
  ON public.notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspace_members ON workspace_members.workspace_id = accounts.workspace_id
      WHERE accounts.id = notes.account_id
      AND workspace_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspaces ON workspaces.id = accounts.workspace_id
      WHERE accounts.id = notes.account_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage notes for accounts they have access to"
  ON public.notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspace_members ON workspace_members.workspace_id = accounts.workspace_id
      WHERE accounts.id = notes.account_id
      AND workspace_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspaces ON workspaces.id = accounts.workspace_id
      WHERE accounts.id = notes.account_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Update reminder policies
CREATE POLICY "Users can view reminders for accounts they have access to"
  ON public.reminders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspace_members ON workspace_members.workspace_id = accounts.workspace_id
      WHERE accounts.id = reminders.account_id
      AND workspace_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspaces ON workspaces.id = accounts.workspace_id
      WHERE accounts.id = reminders.account_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage reminders for accounts they have access to"
  ON public.reminders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspace_members ON workspace_members.workspace_id = accounts.workspace_id
      WHERE accounts.id = reminders.account_id
      AND workspace_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.accounts
      JOIN public.workspaces ON workspaces.id = accounts.workspace_id
      WHERE accounts.id = reminders.account_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();