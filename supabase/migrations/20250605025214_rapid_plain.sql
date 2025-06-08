/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to auth.users
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `accounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `username` (text)
      - `website` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `notes`
      - `id` (uuid, primary key)
      - `account_id` (uuid, foreign key to accounts)
      - `title` (text)
      - `content` (text)
      - `type` (text)
      - `created_at` (timestamp)
    - `reminders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `account_id` (uuid, foreign key to accounts)
      - `title` (text)
      - `content` (text)
      - `date` (timestamp)
      - `completed` (boolean)
      - `created_at` (timestamp)
    - `assistants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamp)
    - `account_assistants`
      - `account_id` (uuid, foreign key to accounts)
      - `assistant_id` (uuid, foreign key to assistants)
      - Primary key (account_id, assistant_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- 1. Drop policies that depend on these tables (add more as needed)
DROP POLICY IF EXISTS "Users can view accounts in their workspaces" ON accounts;
DROP POLICY IF EXISTS "Workspace owners can manage accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view notes for accounts they have access to" ON notes;
DROP POLICY IF EXISTS "Users can manage notes for accounts they have access to" ON notes;
DROP POLICY IF EXISTS "Users can view reminders for accounts they have access to" ON reminders;
DROP POLICY IF EXISTS "Users can manage reminders for accounts they have access to" ON reminders;

-- 2. Drop tables in dependency order
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS workspaces;
DROP TABLE IF EXISTS public.users;

-- 3. Recreate tables with correct relationships

-- Workspaces
CREATE TABLE workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workspace Members
CREATE TABLE workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'admin', 'member')) NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Accounts
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  username text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  assigned_to uuid[] -- If you want to support multiple assignees, otherwise remove
);

-- Notes
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('regular', 'report')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Reminders
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. (Re)add your RLS policies and triggers as needed

-- Example: Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Example: Add updated_at trigger for workspaces and accounts
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- (Re)add your policies here as needed