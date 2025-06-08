-- Vault table for storing encrypted key-value pairs per account
create table vault (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  "key" text not null,
  value text not null,
  created_at timestamp with time zone default now()
);