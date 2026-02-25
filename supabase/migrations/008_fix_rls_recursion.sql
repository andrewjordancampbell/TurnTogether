-- Fix: Infinite recursion in RLS policies for clubs ↔ club_members.
--
-- Problem: The clubs UPDATE policy has a direct inline SELECT on club_members.
-- The club_members SELECT policy ("Public club members visible to everyone")
-- has a direct inline SELECT on clubs. PostgreSQL's planner detects this as
-- circular: clubs → club_members → clubs → RECURSION.
--
-- Solution: Wrap all cross-table references in SECURITY DEFINER plpgsql
-- functions. The planner won't follow into opaque function calls, breaking
-- the detected cycle. SECURITY DEFINER also bypasses RLS inside the function,
-- preventing actual runtime recursion.

-- 1. Helper: check if user is admin of a club (used by clubs UPDATE policy)
create or replace function is_club_admin(p_club_id bigint)
returns boolean as $$
begin
  return exists (
    select 1 from club_members
    where club_id = p_club_id
      and user_id = (select auth.uid())
      and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- 2. Helper: check if a club is public (used by club_members SELECT policy)
create or replace function is_public_club(p_club_id bigint)
returns boolean as $$
begin
  return exists (
    select 1 from clubs
    where id = p_club_id
      and is_public = true
  );
end;
$$ language plpgsql security definer stable;

-- 3. Upgrade is_club_member from SQL to plpgsql for consistency
--    (SQL functions can be inlined by the planner; plpgsql cannot)
create or replace function is_club_member(p_club_id bigint)
returns boolean as $$
begin
  return exists (
    select 1 from club_members
    where club_id = p_club_id
      and user_id = (select auth.uid())
  );
end;
$$ language plpgsql security definer stable;

-- 4. Replace clubs UPDATE policy to use function instead of inline subquery
drop policy "Club admins can update club" on clubs;
create policy "Club admins can update club"
  on clubs for update to authenticated
  using (is_club_admin(id));

-- 5. Replace club_members SELECT policy to use function instead of inline subquery
drop policy "Public club members visible to everyone" on club_members;
create policy "Public club members visible to everyone"
  on club_members for select
  using (is_public_club(club_id));
