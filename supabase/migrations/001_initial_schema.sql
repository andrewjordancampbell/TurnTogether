-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Books (cached metadata from Open Library)
create table books (
  id bigint primary key generated always as identity,
  open_library_key text unique,
  title text not null,
  author_name text not null,
  cover_url text,
  description text,
  isbn text,
  page_count int,
  first_publish_year int,
  created_at timestamptz default now()
);

alter table books enable row level security;

-- Clubs
create table clubs (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  is_public boolean default false,
  invite_code text unique default gen_random_uuid()::text,
  created_by uuid references profiles(id),
  current_book_id bigint references books(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clubs enable row level security;

-- Club Members
create table club_members (
  id bigint primary key generated always as identity,
  club_id bigint references clubs(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'moderator', 'member')),
  joined_at timestamptz default now(),
  unique(club_id, user_id)
);

alter table club_members enable row level security;

-- Chapters (user-defined book sections)
create table chapters (
  id bigint primary key generated always as identity,
  book_id bigint references books(id) on delete cascade,
  club_id bigint references clubs(id) on delete cascade,
  title text not null,
  chapter_number int not null,
  start_page int,
  end_page int,
  created_at timestamptz default now()
);

alter table chapters enable row level security;

-- Reading Progress
create table reading_progress (
  id bigint primary key generated always as identity,
  user_id uuid references profiles(id) on delete cascade,
  book_id bigint references books(id) on delete cascade,
  club_id bigint references clubs(id) on delete cascade,
  current_chapter int not null default 0,
  current_page int,
  percent_complete numeric(5,2) default 0,
  last_read_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, book_id, club_id)
);

alter table reading_progress enable row level security;

-- Discussions (chapter-level threads)
create table discussions (
  id bigint primary key generated always as identity,
  club_id bigint references clubs(id) on delete cascade,
  book_id bigint references books(id) on delete cascade,
  chapter_id bigint references chapters(id) on delete cascade,
  author_id uuid references profiles(id),
  title text not null,
  content text,
  created_at timestamptz default now()
);

alter table discussions enable row level security;

-- Comments
create table comments (
  id bigint primary key generated always as identity,
  discussion_id bigint references discussions(id) on delete cascade,
  author_id uuid references profiles(id),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table comments enable row level security;

-- Annotations
create table annotations (
  id bigint primary key generated always as identity,
  user_id uuid references profiles(id) on delete cascade,
  book_id bigint references books(id) on delete cascade,
  club_id bigint references clubs(id) on delete cascade,
  chapter_number int not null,
  page_number int,
  highlighted_text text,
  note text,
  created_at timestamptz default now()
);

alter table annotations enable row level security;

-- Reading Rooms (live sessions)
create table reading_rooms (
  id bigint primary key generated always as identity,
  club_id bigint references clubs(id) on delete cascade,
  name text not null,
  is_active boolean default true,
  started_at timestamptz default now(),
  ended_at timestamptz
);

alter table reading_rooms enable row level security;

-- Indexes
create index idx_club_members_user on club_members(user_id);
create index idx_club_members_club on club_members(club_id);
create index idx_club_members_composite on club_members(club_id, user_id);
create index idx_reading_progress_user on reading_progress(user_id);
create index idx_reading_progress_club_book on reading_progress(club_id, book_id);
create index idx_discussions_club on discussions(club_id);
create index idx_discussions_chapter on discussions(chapter_id);
create index idx_comments_discussion on comments(discussion_id);
create index idx_annotations_book_club on annotations(book_id, club_id);
create index idx_chapters_book_club on chapters(book_id, club_id);
