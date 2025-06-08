-- Drop policies that depend on workspace_members
DROP POLICY IF EXISTS "Users can view accounts in their workspaces" ON accounts;
DROP POLICY IF EXISTS "Users can view notes for accounts they have access to" ON notes;
DROP POLICY IF EXISTS "Users can manage notes for accounts they have access to" ON notes;
DROP POLICY IF EXISTS "Users can view reminders for accounts they have access to" ON reminders;
DROP POLICY IF EXISTS "Users can manage reminders for accounts they have access to" ON reminders;

-- Drop policies that depend on workspaces
DROP POLICY IF EXISTS "Workspace owners can manage accounts" ON accounts;

-- Drop foreign key constraints that depend on workspaces
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_workspace_id_fkey;

-- Now drop the tables
DROP TABLE IF EXISTS public.workspace_members;
DROP TABLE IF EXISTS public.workspaces;

-- Create workspaces table
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'admin', 'member')) NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

-- Create more permissive policies for testing
CREATE POLICY "Enable all access for authenticated users"
  ON public.workspaces
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users"
  ON public.workspace_members
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON public.workspaces;

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
