-- Fix: RLS policy blocks club admin creation
-- The original "Users can join clubs" policy only allows role = 'member',
-- which silently rejects the admin insert when creating a club.

drop policy "Users can join clubs" on club_members;

create policy "Users can join clubs as members"
  on club_members for insert to authenticated
  with check (user_id = (select auth.uid()) and role = 'member');

create policy "Club creators can set admin role"
  on club_members for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'admin'
    and exists (
      select 1 from clubs
      where clubs.id = club_members.club_id
        and clubs.created_by = (select auth.uid())
    )
  );
