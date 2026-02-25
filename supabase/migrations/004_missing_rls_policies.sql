-- Fix A: Missing DELETE policies for clubs and chapters, and UPDATE policy for books

-- Club creators can delete their own clubs (needed for createClub rollback)
create policy "Club creators can delete own clubs"
  on clubs for delete to authenticated
  using (created_by = (select auth.uid()));

-- Club admins can delete chapters
create policy "Club admins can delete chapters"
  on chapters for delete to authenticated
  using (
    exists (
      select 1 from club_members
      where club_members.club_id = chapters.club_id
        and club_members.user_id = (select auth.uid())
        and club_members.role = 'admin'
    )
  );

-- Authenticated users can update cached book metadata
create policy "Authenticated users can update books"
  on books for update to authenticated
  using (true)
  with check (true);

-- Fix H: Anyone can see member count of public clubs
create policy "Public club members visible to everyone"
  on club_members for select
  using (
    exists (
      select 1 from clubs
      where clubs.id = club_members.club_id
        and clubs.is_public = true
    )
  );
