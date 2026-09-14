create table players (
  id uuid primary key references auth.users(id),
  name text not null,
  section text not null,
  created_at timestamptz not null default now()
);

alter table players enable row level security;

create policy "players can read own row"
  on players for select using (auth.uid() = id);

create policy "players can insert own row"
  on players for insert with check (auth.uid() = id);

create policy "players can update own row"
  on players for update using (auth.uid() = id);
