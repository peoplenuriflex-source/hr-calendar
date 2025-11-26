-- Create events table
create table public.events (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  description text null,
  memo text null, -- Added memo field
  event_date date not null,
  type text not null, -- 'payroll', 'settlement', 'onboarding', 'resignation', 'vacation', 'education', 'notice', 'other'
  constraint events_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.events enable row level security;

-- Create policy to allow everyone to read/write (since it's a shared team app without auth for now)
-- Note: In a real production app, you'd want authentication.
create policy "Enable read access for all users" on public.events
  for select using (true);

create policy "Enable insert access for all users" on public.events
  for insert with check (true);

create policy "Enable update access for all users" on public.events
  for update using (true);

create policy "Enable delete access for all users" on public.events
  for delete using (true);
