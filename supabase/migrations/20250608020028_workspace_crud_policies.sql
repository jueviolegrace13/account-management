-- Enable RLS and add CRUD policies for workspaces
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workspaces"
  ON workspaces
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create workspaces"
  ON workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their workspaces"
  ON workspaces
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their workspaces"
  ON workspaces
  FOR DELETE
  USING (auth.uid() = owner_id); 