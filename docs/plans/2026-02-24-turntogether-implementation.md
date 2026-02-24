# TurnTogether Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a social reading platform for book clubs with progress tracking, chapter discussions, annotations, and live reading rooms.

**Architecture:** Next.js 14 App Router with Supabase (Postgres + Auth + Realtime + Storage). Server Components for data fetching, Server Actions for mutations, Supabase Realtime for live features. Hosted on Vercel.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Vitest, React Testing Library, Playwright

---

## Phase 1: Project Scaffolding & Auth

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Step 1: Scaffold the project**

Run:
```bash
cd ~/Documents/TurnTogether
npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --yes
```
Expected: Project scaffolded with Next.js, TypeScript, Tailwind, App Router

**Step 2: Install Supabase packages**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 3: Install dev dependencies**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 4: Create Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 5: Add test script to package.json**

Add to `scripts`:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 6: Verify everything works**

Run:
```bash
npm run build && npm run dev
```
Expected: App runs at http://localhost:3000

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Supabase and Vitest"
```

---

### Task 2: Set Up Supabase Project & Client Utilities

**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`

**Step 1: Create Supabase project**

Go to https://supabase.com/dashboard and create a new project called "turntogether". Copy the project URL and anon key.

**Step 2: Create .env.local**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add `.env.local` to `.gitignore` (should already be there from create-next-app).

**Step 3: Create .env.example for other developers**

Create `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

**Step 4: Create browser client utility**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 5: Create server client utility**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — middleware handles refresh
          }
        },
      },
    }
  )
}
```

**Step 6: Create middleware session helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/discover') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**Step 7: Create Next.js middleware**

Create `src/middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Supabase client utilities and auth middleware"
```

---

### Task 3: Auth Pages (Login & Signup)

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/actions.ts`
- Create: `src/app/signup/page.tsx`
- Create: `src/app/signup/actions.ts`
- Create: `src/app/auth/callback/route.ts`

**Step 1: Create login server actions**

Create `src/app/login/actions.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(data.url)
}
```

**Step 2: Create login page**

Create `src/app/login/page.tsx`:
```typescript
import { login, loginWithGoogle } from './actions'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-4">
        <h1 className="text-2xl font-bold text-center">Log in to TurnTogether</h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required
              className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" required
              className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <button formAction={login}
            className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800">
            Log in
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <form>
          <button formAction={loginWithGoogle}
            className="w-full rounded-md border py-2 hover:bg-gray-50">
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account? <a href="/signup" className="underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}
```

**Step 3: Create signup server actions**

Create `src/app/signup/actions.ts`:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        display_name: formData.get('display_name') as string,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

**Step 4: Create signup page**

Create `src/app/signup/page.tsx`:
```typescript
import { signup } from './actions'
import { loginWithGoogle } from '../login/actions'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-4">
        <h1 className="text-2xl font-bold text-center">Join TurnTogether</h1>

        <form className="space-y-4">
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium">Display Name</label>
            <input id="display_name" name="display_name" type="text" required
              className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required
              className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" required minLength={6}
              className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <button formAction={signup}
            className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800">
            Sign up
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <form>
          <button formAction={loginWithGoogle}
            className="w-full rounded-md border py-2 hover:bg-gray-50">
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </p>
      </div>
    </div>
  )
}
```

**Step 5: Create OAuth callback route**

Create `src/app/auth/callback/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

**Step 6: Verify login/signup pages render**

Run: `npm run dev`
Visit http://localhost:3000/login and http://localhost:3000/signup
Expected: Both forms render correctly

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add login and signup pages with email + Google OAuth"
```

---

## Phase 2: Database Schema & RLS

### Task 4: Create Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Install Supabase CLI**

Run:
```bash
npm install -D supabase
npx supabase init
```

**Step 2: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
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
```

**Step 3: Push migration to Supabase**

Run:
```bash
npx supabase db push
```
Expected: Migration applied successfully

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add database schema with all tables and indexes"
```

---

### Task 5: Add Row Level Security Policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

**Step 1: Create RLS policy migration**

Create `supabase/migrations/002_rls_policies.sql`:
```sql
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
  with check (user_id = (select auth.uid()));

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
  with check (user_id = (select auth.uid()));

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
```

**Step 2: Push migration**

Run:
```bash
npx supabase db push
```
Expected: RLS policies applied

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add RLS policies and enable Realtime on key tables"
```

---

## Phase 3: Book Search

### Task 6: Open Library API Integration

**Files:**
- Create: `src/lib/books/open-library.ts`
- Create: `src/lib/books/types.ts`
- Test: `src/lib/books/__tests__/open-library.test.ts`

**Step 1: Write the types**

Create `src/lib/books/types.ts`:
```typescript
export interface BookSearchResult {
  openLibraryKey: string
  title: string
  authorName: string
  coverUrl: string | null
  firstPublishYear: number | null
  isbn: string | null
  pageCount: number | null
}

export interface BookDetail extends BookSearchResult {
  description: string | null
}
```

**Step 2: Write failing test for search**

Create `src/lib/books/__tests__/open-library.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks, getBookByKey } from '../open-library'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('searchBooks', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns parsed book results from Open Library', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        docs: [{
          key: '/works/OL45883W',
          title: 'The Great Gatsby',
          author_name: ['F. Scott Fitzgerald'],
          cover_i: 5428170,
          first_publish_year: 1925,
          isbn: ['0451524934'],
          number_of_pages_median: 180,
        }],
      }),
    })

    const results = await searchBooks('great gatsby')

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      openLibraryKey: '/works/OL45883W',
      title: 'The Great Gatsby',
      authorName: 'F. Scott Fitzgerald',
      coverUrl: 'https://covers.openlibrary.org/b/id/5428170-M.jpg',
      firstPublishYear: 1925,
      isbn: '0451524934',
      pageCount: 180,
    })
  })

  it('returns empty array on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    const results = await searchBooks('nonexistent')
    expect(results).toEqual([])
  })
})
```

**Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/books/__tests__/open-library.test.ts`
Expected: FAIL — module not found

**Step 4: Write implementation**

Create `src/lib/books/open-library.ts`:
```typescript
import type { BookSearchResult, BookDetail } from './types'

const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org'

export async function searchBooks(query: string, limit = 10): Promise<BookSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      fields: 'key,title,author_name,cover_i,first_publish_year,isbn,number_of_pages_median',
    })

    const res = await fetch(`${BASE_URL}/search.json?${params}`, {
      headers: { 'User-Agent': 'TurnTogether (turntogether@example.com)' },
    })

    if (!res.ok) return []

    const data = await res.json()

    return data.docs.map((doc: Record<string, unknown>) => ({
      openLibraryKey: doc.key as string,
      title: doc.title as string,
      authorName: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown',
      coverUrl: doc.cover_i
        ? `${COVERS_URL}/b/id/${doc.cover_i}-M.jpg`
        : null,
      firstPublishYear: (doc.first_publish_year as number) ?? null,
      isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
      pageCount: (doc.number_of_pages_median as number) ?? null,
    }))
  } catch {
    return []
  }
}

export async function getBookByKey(key: string): Promise<BookDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}${key}.json`, {
      headers: { 'User-Agent': 'TurnTogether (turntogether@example.com)' },
    })

    if (!res.ok) return null

    const data = await res.json()

    return {
      openLibraryKey: key,
      title: data.title,
      authorName: 'Unknown', // Requires separate author fetch
      coverUrl: data.covers?.[0]
        ? `${COVERS_URL}/b/id/${data.covers[0]}-M.jpg`
        : null,
      firstPublishYear: data.first_publish_date
        ? parseInt(data.first_publish_date)
        : null,
      isbn: null,
      pageCount: null,
      description: typeof data.description === 'string'
        ? data.description
        : data.description?.value ?? null,
    }
  } catch {
    return null
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/books/__tests__/open-library.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Open Library API integration for book search"
```

---

## Phase 4: Core Features

### Task 7: Book Search Page

**Files:**
- Create: `src/app/books/search/page.tsx`
- Create: `src/components/book-search.tsx`
- Create: `src/components/book-card.tsx`

**Step 1: Create BookCard component**

Create `src/components/book-card.tsx`:
```typescript
import type { BookSearchResult } from '@/lib/books/types'

export function BookCard({ book }: { book: BookSearchResult }) {
  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title}
          className="h-32 w-20 rounded object-cover" />
      ) : (
        <div className="flex h-32 w-20 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
          No cover
        </div>
      )}
      <div>
        <h3 className="font-semibold">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.authorName}</p>
        {book.firstPublishYear && (
          <p className="text-xs text-gray-400">{book.firstPublishYear}</p>
        )}
        {book.pageCount && (
          <p className="text-xs text-gray-400">{book.pageCount} pages</p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Create BookSearch client component**

Create `src/components/book-search.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { searchBooks } from '@/lib/books/open-library'
import { BookCard } from './book-card'
import type { BookSearchResult } from '@/lib/books/types'

export function BookSearch({ onSelect }: { onSelect?: (book: BookSearchResult) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const books = await searchBooks(query)
    setResults(books)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book..."
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button type="submit" disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="space-y-2">
        {results.map((book) => (
          <button key={book.openLibraryKey} onClick={() => onSelect?.(book)}
            className="w-full text-left hover:bg-gray-50 rounded-lg">
            <BookCard book={book} />
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Create search page**

Create `src/app/books/search/page.tsx`:
```typescript
import { BookSearch } from '@/components/book-search'

export default function BookSearchPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Find a Book</h1>
      <BookSearch />
    </div>
  )
}
```

**Step 4: Verify the page works**

Run: `npm run dev`
Visit http://localhost:3000/books/search
Expected: Search input renders, searching returns book results with covers

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add book search page with Open Library integration"
```

---

### Task 8: Create Club Flow

**Files:**
- Create: `src/app/clubs/new/page.tsx`
- Create: `src/app/clubs/new/actions.ts`
- Create: `src/app/clubs/[id]/page.tsx`

**Step 1: Create club server action**

Create `src/app/clubs/new/actions.ts`:
```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createClub(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: club, error } = await supabase
    .from('clubs')
    .insert({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      is_public: formData.get('is_public') === 'true',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Add creator as admin
  await supabase.from('club_members').insert({
    club_id: club.id,
    user_id: user.id,
    role: 'admin',
  })

  redirect(`/clubs/${club.id}`)
}
```

**Step 2: Create new club page**

Create `src/app/clubs/new/page.tsx`:
```typescript
import { createClub } from './actions'

export default function NewClubPage() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-bold">Start a Book Club</h1>

      <form action={createClub} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Club Name</label>
          <input id="name" name="name" type="text" required
            className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea id="description" name="description" rows={3}
            className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="is_public" name="is_public" type="checkbox" value="true" />
          <label htmlFor="is_public" className="text-sm">Make this club public (anyone can join)</label>
        </div>
        <button type="submit"
          className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800">
          Create Club
        </button>
      </form>
    </div>
  )
}
```

**Step 3: Create club detail page**

Create `src/app/clubs/[id]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select(`
      *,
      current_book:books(*),
      club_members(*, profile:profiles(*))
    `)
    .eq('id', id)
    .single()

  if (!club) notFound()

  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, profile:profiles(*)')
    .eq('club_id', id)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        {club.description && (
          <p className="mt-2 text-gray-600">{club.description}</p>
        )}
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs">
          {club.is_public ? 'Public' : 'Private'} · {club.club_members?.length ?? 0} members
        </span>
      </div>

      {club.current_book && (
        <div className="mb-8 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Currently Reading</h2>
          <div className="flex gap-4">
            {club.current_book.cover_url && (
              <img src={club.current_book.cover_url} alt={club.current_book.title}
                className="h-40 w-28 rounded object-cover" />
            )}
            <div>
              <h3 className="font-semibold">{club.current_book.title}</h3>
              <p className="text-sm text-gray-600">{club.current_book.author_name}</p>
            </div>
          </div>

          {progress && progress.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Group Progress</h3>
              {progress.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-24 truncate text-sm">{p.profile?.display_name}</span>
                  <div className="flex-1 rounded-full bg-gray-100">
                    <div className="rounded-full bg-black py-1 text-center text-xs text-white"
                      style={{ width: `${Math.max(p.percent_complete, 5)}%` }}>
                      {Math.round(p.percent_complete)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Members</h2>
        <div className="space-y-2">
          {club.club_members?.map((member: { id: number; role: string; profile: { display_name: string } }) => (
            <div key={member.id} className="flex items-center justify-between">
              <span className="text-sm">{member.profile?.display_name}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Verify pages work**

Run: `npm run dev`
Expected: Club creation form renders, submitting creates club and redirects

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add club creation and detail pages"
```

---

### Task 9: Dashboard Page

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Modify: `src/app/page.tsx` (redirect to dashboard or landing)

**Step 1: Create dashboard page**

Create `src/app/dashboard/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user's clubs with current books and progress
  const { data: memberships } = await supabase
    .from('club_members')
    .select(`
      club:clubs(
        *,
        current_book:books(*),
        club_members(count)
      )
    `)
    .eq('user_id', user.id)

  const clubs = memberships?.map((m) => m.club).filter(Boolean) ?? []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Book Clubs</h1>
        <Link href="/clubs/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Start a Club
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-gray-500">You haven&apos;t joined any book clubs yet.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/clubs/new" className="text-sm underline">Start a club</Link>
            <Link href="/discover" className="text-sm underline">Discover clubs</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {clubs.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}
              className="block rounded-lg border p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{club.name}</h2>
                  {club.current_book && (
                    <p className="text-sm text-gray-600">
                      Reading: {club.current_book.title}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  {club.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Update root page**

Modify `src/app/page.tsx` to serve as a landing page that redirects authenticated users:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="mb-4 text-4xl font-bold">TurnTogether</h1>
      <p className="mb-8 text-lg text-gray-600">Turn pages together. Your book club, always on.</p>
      <div className="flex gap-4">
        <Link href="/signup"
          className="rounded-md bg-black px-6 py-2 text-white hover:bg-gray-800">
          Get Started
        </Link>
        <Link href="/login"
          className="rounded-md border px-6 py-2 hover:bg-gray-50">
          Log In
        </Link>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dashboard and landing page"
```

---

### Task 10: Reading Progress Tracking

**Files:**
- Create: `src/components/progress-updater.tsx`
- Create: `src/app/clubs/[id]/progress/actions.ts`

**Step 1: Create progress server action**

Create `src/app/clubs/[id]/progress/actions.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clubId = Number(formData.get('club_id'))
  const bookId = Number(formData.get('book_id'))
  const currentChapter = Number(formData.get('current_chapter'))
  const currentPage = formData.get('current_page') ? Number(formData.get('current_page')) : null
  const totalPages = formData.get('total_pages') ? Number(formData.get('total_pages')) : null

  const percentComplete = totalPages && currentPage
    ? Math.round((currentPage / totalPages) * 100)
    : 0

  const { error } = await supabase
    .from('reading_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      club_id: clubId,
      current_chapter: currentChapter,
      current_page: currentPage,
      percent_complete: percentComplete,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,book_id,club_id',
    })

  if (error) return { error: error.message }

  revalidatePath(`/clubs/${clubId}`)
}
```

**Step 2: Create progress updater component**

Create `src/components/progress-updater.tsx`:
```typescript
'use client'

import { updateProgress } from '@/app/clubs/[id]/progress/actions'

interface ProgressUpdaterProps {
  clubId: number
  bookId: number
  currentChapter?: number
  currentPage?: number
  totalPages?: number
}

export function ProgressUpdater({ clubId, bookId, currentChapter, currentPage, totalPages }: ProgressUpdaterProps) {
  return (
    <form action={updateProgress} className="rounded-lg border p-4">
      <h3 className="mb-3 text-sm font-semibold">Update Your Progress</h3>
      <input type="hidden" name="club_id" value={clubId} />
      <input type="hidden" name="book_id" value={bookId} />
      {totalPages && <input type="hidden" name="total_pages" value={totalPages} />}

      <div className="flex gap-3">
        <div>
          <label className="block text-xs text-gray-500">Chapter</label>
          <input type="number" name="current_chapter" min={0}
            defaultValue={currentChapter ?? 0}
            className="w-20 rounded border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500">Page</label>
          <input type="number" name="current_page" min={0}
            defaultValue={currentPage ?? ''}
            className="w-20 rounded border px-2 py-1 text-sm" />
        </div>
        <button type="submit"
          className="self-end rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">
          Save
        </button>
      </div>
    </form>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add reading progress tracking with upsert"
```

---

### Task 11: Chapter Discussions

**Files:**
- Create: `src/app/clubs/[id]/discussions/page.tsx`
- Create: `src/app/clubs/[id]/discussions/[discussionId]/page.tsx`
- Create: `src/app/clubs/[id]/discussions/actions.ts`

**Step 1: Create discussion server actions**

Create `src/app/clubs/[id]/discussions/actions.ts`:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDiscussion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const clubId = Number(formData.get('club_id'))
  const bookId = Number(formData.get('book_id'))
  const chapterId = formData.get('chapter_id') ? Number(formData.get('chapter_id')) : null

  const { error } = await supabase.from('discussions').insert({
    club_id: clubId,
    book_id: bookId,
    chapter_id: chapterId,
    author_id: user.id,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
  })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${clubId}/discussions`)
}

export async function addComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const discussionId = Number(formData.get('discussion_id'))
  const clubId = formData.get('club_id') as string

  const { error } = await supabase.from('comments').insert({
    discussion_id: discussionId,
    author_id: user.id,
    content: formData.get('content') as string,
  })

  if (error) return { error: error.message }
  revalidatePath(`/clubs/${clubId}/discussions/${discussionId}`)
}
```

**Step 2: Create discussions list page**

Create `src/app/clubs/[id]/discussions/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createDiscussion } from './actions'

export default async function DiscussionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: discussions } = await supabase
    .from('discussions')
    .select('*, author:profiles(*), chapter:chapters(*), comments(count)')
    .eq('club_id', id)
    .order('created_at', { ascending: false })

  const { data: club } = await supabase
    .from('clubs')
    .select('*, current_book:books(*)')
    .eq('id', id)
    .single()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Discussions</h1>
        <Link href={`/clubs/${id}`} className="text-sm text-gray-500 hover:underline">Back to club</Link>
      </div>

      <form action={createDiscussion} className="mb-8 rounded-lg border p-4">
        <h2 className="mb-3 font-semibold">Start a Discussion</h2>
        <input type="hidden" name="club_id" value={id} />
        {club?.current_book && <input type="hidden" name="book_id" value={club.current_book.id} />}
        <input name="title" placeholder="Discussion title" required
          className="mb-2 w-full rounded border px-3 py-2" />
        <textarea name="content" placeholder="What's on your mind?" rows={3}
          className="mb-2 w-full rounded border px-3 py-2" />
        <button type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Post
        </button>
      </form>

      <div className="space-y-3">
        {discussions?.map((d) => (
          <Link key={d.id} href={`/clubs/${id}/discussions/${d.id}`}
            className="block rounded-lg border p-4 hover:bg-gray-50">
            <h3 className="font-semibold">{d.title}</h3>
            <p className="text-sm text-gray-600">
              {d.author?.display_name} · {d.chapter?.title ?? 'General'}
              {' · '}{d.comments?.[0]?.count ?? 0} comments
            </p>
          </Link>
        ))}
        {(!discussions || discussions.length === 0) && (
          <p className="text-center text-gray-400">No discussions yet. Start one above!</p>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create discussion detail page with comments**

Create `src/app/clubs/[id]/discussions/[discussionId]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { addComment } from '../actions'

export default async function DiscussionPage({
  params,
}: {
  params: Promise<{ id: string; discussionId: string }>
}) {
  const { id, discussionId } = await params
  const supabase = await createClient()

  const { data: discussion } = await supabase
    .from('discussions')
    .select('*, author:profiles(*), chapter:chapters(*)')
    .eq('id', discussionId)
    .single()

  if (!discussion) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, author:profiles(*)')
    .eq('discussion_id', discussionId)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{discussion.title}</h1>
        <p className="text-sm text-gray-500">
          {discussion.author?.display_name} · {discussion.chapter?.title ?? 'General'}
        </p>
        {discussion.content && (
          <p className="mt-4">{discussion.content}</p>
        )}
      </div>

      <div className="mb-6 space-y-4">
        {comments?.map((c) => (
          <div key={c.id} className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium">{c.author?.display_name}</p>
            <p className="mt-1 text-sm">{c.content}</p>
          </div>
        ))}
      </div>

      <form action={addComment} className="rounded-lg border p-4">
        <input type="hidden" name="discussion_id" value={discussionId} />
        <input type="hidden" name="club_id" value={id} />
        <textarea name="content" placeholder="Add a comment..." rows={2} required
          className="mb-2 w-full rounded border px-3 py-2" />
        <button type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
          Comment
        </button>
      </form>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add chapter discussions with threaded comments"
```

---

### Task 12: Discovery Page

**Files:**
- Create: `src/app/discover/page.tsx`

**Step 1: Create discovery page**

Create `src/app/discover/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, current_book:books(*), club_members(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Discover Book Clubs</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {clubs?.map((club) => (
          <Link key={club.id} href={`/clubs/${club.id}`}
            className="rounded-lg border p-4 hover:bg-gray-50">
            <h2 className="font-semibold">{club.name}</h2>
            {club.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{club.description}</p>
            )}
            {club.current_book && (
              <p className="mt-2 text-xs text-gray-400">
                Reading: {club.current_book.title}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              {club.club_members?.[0]?.count ?? 0} members
            </p>
          </Link>
        ))}
        {(!clubs || clubs.length === 0) && (
          <p className="col-span-2 text-center text-gray-400">
            No public clubs yet. <Link href="/clubs/new" className="underline">Start one!</Link>
          </p>
        )}
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add public club discovery page"
```

---

### Task 13: Navigation Layout

**Files:**
- Create: `src/components/nav.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create navigation component**

Create `src/components/nav.tsx`:
```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">TurnTogether</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/discover" className="hover:underline">Discover</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/books/search" className="hover:underline">Search Books</Link>
              <form action="/auth/signout" method="post">
                <button className="hover:underline">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/signup" className="rounded bg-black px-3 py-1 text-white hover:bg-gray-800">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
```

**Step 2: Add signout route**

Create `src/app/auth/signout/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', request.url))
}
```

**Step 3: Update root layout to include nav**

Modify `src/app/layout.tsx` to add `<Nav />` inside the body, above `{children}`.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add navigation bar with auth-aware links"
```

---

## Phase 5: Realtime Features

### Task 14: Live Reading Room

**Files:**
- Create: `src/app/clubs/[id]/room/page.tsx`
- Create: `src/components/reading-room.tsx`

**Step 1: Create reading room client component**

Create `src/components/reading-room.tsx`:
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Participant {
  userId: string
  displayName: string
  onlineAt: string
}

interface ChatMessage {
  userId: string
  displayName: string
  text: string
  timestamp: string
}

export function ReadingRoom({ clubId, userId, displayName }: {
  clubId: string
  userId: string
  displayName: string
}) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel(`room-${clubId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat() as Participant[]
        setParticipants(users)
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as ChatMessage])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            displayName,
            onlineAt: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clubId, userId, displayName, supabase])

  function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return

    const channel = supabase.channel(`room-${clubId}`)
    channel.send({
      type: 'broadcast',
      event: 'chat',
      payload: {
        userId,
        displayName,
        text: input,
        timestamp: new Date().toISOString(),
      },
    })
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Participants sidebar */}
      <div className="w-48 rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Reading Now ({participants.length})
        </h3>
        <div className="space-y-2">
          {participants.map((p) => (
            <div key={p.userId} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm">{p.displayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-lg border">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{msg.displayName}: </span>
              <span>{msg.text}</span>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm">
              Welcome to the reading room. Chat while you read!
            </p>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex border-t p-3 gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            className="flex-1 rounded border px-3 py-1 text-sm"
          />
          <button type="submit"
            className="rounded bg-black px-3 py-1 text-sm text-white hover:bg-gray-800">
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Create reading room page**

Create `src/app/clubs/[id]/room/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReadingRoom } from '@/components/reading-room'

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-bold">Reading Room</h1>
      <ReadingRoom
        clubId={id}
        userId={user.id}
        displayName={profile?.display_name ?? 'Reader'}
      />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add live reading room with presence and chat"
```

---

## Phase 6: Polish & Deploy

### Task 15: Profile Page

**Files:**
- Create: `src/app/profile/page.tsx`

**Step 1: Create profile page**

Create `src/app/profile/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('club_members')
    .select('club:clubs(name)')
    .eq('user_id', user.id)

  const { data: progress } = await supabase
    .from('reading_progress')
    .select('*, book:books(*)')
    .eq('user_id', user.id)

  const booksCompleted = progress?.filter((p) => p.percent_complete >= 100).length ?? 0
  const booksInProgress = progress?.filter((p) => p.percent_complete < 100).length ?? 0

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold">{profile?.display_name}</h1>
      {profile?.bio && <p className="mb-6 text-gray-600">{profile.bio}</p>}

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{booksCompleted}</p>
          <p className="text-xs text-gray-500">Books Completed</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{booksInProgress}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold">{memberships?.length ?? 0}</p>
          <p className="text-xs text-gray-500">Clubs</p>
        </div>
      </div>

      {progress && progress.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Reading History</h2>
          <div className="space-y-2">
            {progress.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium text-sm">{p.book?.title}</span>
                <span className="text-xs text-gray-400">{Math.round(p.percent_complete)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add user profile page with reading stats"
```

---

### Task 16: Deploy to Vercel

**Step 1: Push to GitHub**

```bash
gh repo create TurnTogether --public --source=. --push
```

**Step 2: Deploy to Vercel**

- Go to https://vercel.com/new
- Import the TurnTogether repo
- Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
- Deploy

**Step 3: Configure Supabase auth redirect URLs**

In Supabase Dashboard > Authentication > URL Configuration:
- Add your Vercel URL to "Redirect URLs"

**Step 4: Commit any deployment config**

```bash
git add -A
git commit -m "chore: deployment configuration"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Scaffolding & Auth | 1-3 | Project setup, Supabase clients, login/signup |
| 2: Database | 4-5 | Full schema, RLS policies, Realtime enabled |
| 3: Book Search | 6 | Open Library integration |
| 4: Core Features | 7-13 | Search page, clubs, progress, discussions, discovery, nav |
| 5: Realtime | 14 | Live reading room with presence + chat |
| 6: Polish & Deploy | 15-16 | Profile page, Vercel deployment |
