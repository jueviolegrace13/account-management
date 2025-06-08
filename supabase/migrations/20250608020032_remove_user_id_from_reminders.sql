-- Remove user_id column from reminders table
ALTER TABLE reminders DROP COLUMN IF EXISTS user_id;