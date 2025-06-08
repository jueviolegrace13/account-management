-- Fix foreign key on workspace_members.user_id to reference auth.users(id)
ALTER TABLE public.workspace_members
  DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey;

ALTER TABLE public.workspace_members
  ADD CONSTRAINT workspace_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; 