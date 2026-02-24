-- Helper: check if user is club member
create or replace function is_club_member(p_club_id bigint)
returns boolean as $$
  select exists (
    select 1 from club_members
    where club_id = p_club_id and user_id = (select auth.uid())
  );
$$ language sql security definer stable;

-- PROFILES
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (id = (select auth.uid()));

-- BOOKS (public metadata)
create policy "Books are viewable by everyone"
  on books for select using (true);

create policy "Authenticated users can insert books"
  on books for insert to authenticated with check (true);

-- CLUBS
create policy "Public clubs are viewable by everyone"
  on clubs for select using (is_public = true);

create policy "Private clubs viewable by members"
  on clubs for select using (
    is_public = false and is_club_member(id)
  );

create policy "Authenticated users can create clubs"
  on clubs for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Club admins can update club"
  on clubs for update to authenticated using (
    exists (
      select 1 from club_members
      where club_id = clubs.id
        and user_id = (select auth.uid())
        and role = 'admin'
    )
  );

-- CLUB MEMBERS
create policy "Members can view fellow members"
  on club_members for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Users can join clubs"
  on club_members for insert to authenticated
  with check (user_id = (select auth.uid()) and role = 'member');

create policy "Users can leave clubs"
  on club_members for delete to authenticated
  using (user_id = (select auth.uid()));

-- CHAPTERS
create policy "Chapters viewable by club members"
  on chapters for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Club admins can manage chapters"
  on chapters for insert to authenticated with check (
    exists (
      select 1 from club_members
      where club_id = chapters.club_id
        and user_id = (select auth.uid())
        and role = 'admin'
    )
  );

-- READING PROGRESS
create policy "Progress viewable by club members"
  on reading_progress for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Users can update own progress"
  on reading_progress for insert to authenticated
  with check (user_id = (select auth.uid()) and is_club_member(club_id));

create policy "Users can modify own progress"
  on reading_progress for update to authenticated
  using (user_id = (select auth.uid()));

-- DISCUSSIONS
create policy "Discussions viewable by club members"
  on discussions for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Public club discussions viewable by everyone"
  on discussions for select using (
    exists (
      select 1 from clubs where clubs.id = discussions.club_id and clubs.is_public = true
    )
  );

create policy "Members can create discussions"
  on discussions for insert to authenticated with check (
    author_id = (select auth.uid()) and is_club_member(club_id)
  );

-- COMMENTS
create policy "Comments viewable with discussion access"
  on comments for select to authenticated using (
    exists (
      select 1 from discussions
      where discussions.id = comments.discussion_id
        and is_club_member(discussions.club_id)
    )
  );

create policy "Members can create comments"
  on comments for insert to authenticated with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from discussions
      join club_members on club_members.club_id = discussions.club_id
      where discussions.id = comments.discussion_id
        and club_members.user_id = (select auth.uid())
    )
  );

create policy "Authors can update own comments"
  on comments for update to authenticated
  using (author_id = (select auth.uid()));

create policy "Authors can delete own comments"
  on comments for delete to authenticated
  using (author_id = (select auth.uid()));

-- ANNOTATIONS
create policy "Annotations viewable by club members (spoiler-gated in app)"
  on annotations for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Users can create own annotations"
  on annotations for insert to authenticated
  with check (user_id = (select auth.uid()) and is_club_member(club_id));

create policy "Users can delete own annotations"
  on annotations for delete to authenticated
  using (user_id = (select auth.uid()));

-- READING ROOMS
create policy "Rooms viewable by club members"
  on reading_rooms for select to authenticated using (
    is_club_member(club_id)
  );

create policy "Members can create rooms"
  on reading_rooms for insert to authenticated with check (
    is_club_member(club_id)
  );

-- Enable Realtime on key tables
alter publication supabase_realtime add table reading_progress;
alter publication supabase_realtime add table discussions;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table reading_rooms;
