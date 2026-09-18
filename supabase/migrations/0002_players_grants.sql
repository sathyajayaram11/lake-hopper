-- 0001_players.sql created the table and RLS policies, but RLS only controls
-- *which rows* a role can touch, not whether the operation is allowed at all.
-- Tables created via raw SQL (not the dashboard Table Editor) don't get
-- Supabase's default grants, so anonymous-auth sessions (role: authenticated)
-- got "permission denied for table players" on every insert/upsert.
grant select, insert, update on public.players to authenticated;
