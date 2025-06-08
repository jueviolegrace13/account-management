 -- Add timezone column to workspaces table
ALTER TABLE public.workspaces
  ADD COLUMN timezone text NOT NULL DEFAULT 'UTC';

-- Update existing workspaces to use the system's timezone
UPDATE public.workspaces
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Add comment to explain the timezone column
COMMENT ON COLUMN public.workspaces.timezone IS 'The timezone for this workspace, used for scheduling reminders and displaying times';