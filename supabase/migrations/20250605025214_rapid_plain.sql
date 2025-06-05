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

-- Create tables
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  username text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text CHECK (type IN ('regular', 'report')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.account_assistants (
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  assistant_id uuid REFERENCES public.assistants(id) ON DELETE CASCADE,
  PRIMARY KEY (account_id, assistant_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_assistants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own data"
  ON public.users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own accounts"
  ON public.accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage notes for their accounts"
  ON public.notes
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = notes.account_id
    AND accounts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = notes.account_id
    AND accounts.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own reminders"
  ON public.reminders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own assistants"
  ON public.assistants
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage assistant assignments for their accounts"
  ON public.account_assistants
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = account_assistants.account_id
    AND accounts.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = account_assistants.account_id
    AND accounts.user_id = auth.uid()
  ));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();