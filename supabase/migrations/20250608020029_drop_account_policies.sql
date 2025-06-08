-- Drop all policies for accounts table
DROP POLICY IF EXISTS "Users can view accounts in their workspaces" ON public.accounts;
DROP POLICY IF EXISTS "Workspace owners can manage accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;

-- Drop all policies for workspaces table
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Owners can manage their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.workspaces;

-- Drop all policies for workspace_members table
DROP POLICY IF EXISTS "Users can view workspace members where they are members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.workspace_members;

-- Drop all policies for notes table
DROP POLICY IF EXISTS "Users can view notes for accounts they have access to" ON public.notes;
DROP POLICY IF EXISTS "Users can manage notes for accounts they have access to" ON public.notes;
DROP POLICY IF EXISTS "Users can manage notes for their accounts" ON public.notes;

-- Drop all policies for reminders table
DROP POLICY IF EXISTS "Users can view reminders for accounts they have access to" ON public.reminders;
DROP POLICY IF EXISTS "Users can manage reminders for accounts they have access to" ON public.reminders;
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;

-- Disable RLS on all tables
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders DISABLE ROW LEVEL SECURITY; 