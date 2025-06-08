/*
  # Fix RLS Policies and Add Missing Constraints

  1. Security Updates
    - Fix RLS policies for proper workspace access
    - Add missing policies for notes and reminders
    - Ensure proper user access control

  2. Data Integrity
    - Add proper foreign key constraints
    - Fix reminder table structure
*/

-- Drop existing policies to recreate them properly
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can manage their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view accounts in their workspaces" ON public.accounts;
DROP POLICY IF EXISTS "Workspace owners can manage accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can manage notes for their accounts" ON public.notes;
DROP POLICY IF EXISTS "Users can view notes for accounts they have access to" ON public.notes;
DROP POLICY IF EXISTS "Users can manage notes for accounts they have access to" ON public.notes;
DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can view reminders for accounts they have access to" ON public.reminders;
DROP POLICY IF EXISTS "Users can manage reminders for accounts they have access to" ON public.reminders;


-- Update accounts policies
CREATE POLICY "Users can manage their own accounts"
  ON public.accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Users can manage notes for their accounts"
  ON public.notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = notes.account_id
      AND accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = notes.account_id
      AND accounts.user_id = auth.uid()
    )
  );

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
CREATE POLICY "Users can manage their own reminders"
  ON public.reminders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

-- Add foreign key constraints that were missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'accounts_workspace_id_fkey'
  ) THEN
    ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_workspace_id_fkey
    FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notes_account_id_fkey'
  ) THEN
    ALTER TABLE public.notes
    ADD CONSTRAINT notes_account_id_fkey
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reminders_account_id_fkey'
  ) THEN
    ALTER TABLE public.reminders
    ADD CONSTRAINT reminders_account_id_fkey
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'notes_author_id_fkey'
  ) THEN
    ALTER TABLE public.notes
    ADD CONSTRAINT notes_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'reminders_author_id_fkey'
  ) THEN
    ALTER TABLE public.reminders
    ADD CONSTRAINT reminders_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;