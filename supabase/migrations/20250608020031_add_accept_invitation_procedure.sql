-- Create function to accept workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation workspace_invitations;
  v_user_id uuid;
BEGIN
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM workspace_invitations
  WHERE id = invitation_id
  FOR UPDATE;

  -- Check if invitation is valid
  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Invitation is no longer valid';
  END IF;

  IF v_invitation.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  -- Get the current user's ID
  v_user_id := auth.uid();

  -- Add user to workspace members
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_invitation.workspace_id, v_user_id, v_invitation.role);

  -- Update invitation status
  UPDATE workspace_invitations
  SET status = 'accepted'
  WHERE id = invitation_id;
END;
$$; 