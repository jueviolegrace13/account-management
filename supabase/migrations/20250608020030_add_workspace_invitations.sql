-- Create workspace invitations table
CREATE TABLE public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text CHECK (role IN ('owner', 'assistant')) NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending', 'accepted', 'expired')) NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view invitations they created"
  ON public.workspace_invitations
  FOR SELECT
  USING (invited_by = auth.uid());

CREATE POLICY "Workspace owners can create invitations"
  ON public.workspace_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_invitations.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update invitations"
  ON public.workspace_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE workspaces.id = workspace_invitations.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_workspace_invitations_updated_at
  BEFORE UPDATE ON public.workspace_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at(); 