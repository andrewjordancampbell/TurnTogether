# TurnTogether — Design Document

## Overview

TurnTogether is a social reading platform for book clubs. Members track reading progress together, discuss chapters, annotate passages, and join live reading rooms. The core daily engagement hook is **progress & pacing** — seeing where everyone is and staying motivated to keep up.

**Target audience:** Anyone in a book club who wants more engagement between meetings.

**Goal:** Ship as a real product.

**Platform:** Web-first (mobile-first responsive), native mobile apps post-launch.

---

## Core Problems Solved

1. **Discussion dies between meetings** — ongoing chapter threads and annotations keep conversation alive
2. **Hard to stay on pace** — real-time progress tracking and group nudges keep members motivated
3. **Surface-level conversations** — chapter-scoped discussions and inline annotations encourage deeper engagement with specific passages

---

## Data Model

```
User
 ├── belongs to many Clubs (via Membership)
 └── has many ReadingProgress entries

Club
 ├── has many Members (via Membership)
 ├── has one active Book (current read)
 └── has many past Books (reading history)

Book (metadata only — from Open Library / Google Books API)
 ├── title, author, cover image, ISBN
 ├── has many Chapters (user-defined sections)
 └── has many Discussions

ReadingProgress
 ├── belongs to User + Book + Club
 └── tracks: current chapter, current page/%, last updated

Discussion (chapter-level threads)
 ├── belongs to Book + Chapter
 ├── has many Comments
 └── scoped to a Club

Annotation (inline highlights/notes)
 ├── belongs to User + Book
 ├── has: page/location, highlighted text, note
 └── visible to Club members when they reach that point

ReadingRoom (live sessions)
 ├── belongs to Club
 ├── has many Participants
 └── has a real-time chat stream
```

**Key decisions:**
- Progress is scoped to a Club — you might read the same book in two clubs at different paces
- Annotations are revealed based on the viewer's progress (no spoilers)
- Chapters are user-defined since we won't have actual book content at launch

---

## Pages & User Flows

### Dashboard (home)
- Active clubs with progress bars showing where everyone is
- Nudges like "You're on Chapter 5 — 3 members are ahead of you"
- Recent discussion activity across clubs
- Upcoming reading room sessions

### Club Page
- Current book with group progress visualization
- Reading schedule (e.g., "Chapters 7-9 by Friday")
- Chapter discussion threads
- Member list with individual progress
- Club settings (public/private, invite link)

### Book Detail Page
- Book metadata (cover, author, description from API)
- Chapter list with discussion counts per chapter
- Your annotations for this book
- "Update Progress" button

### Discussion Thread
- Tied to a specific chapter
- Threaded comments with reactions
- Spoiler gating — can't view or post until you've marked that chapter as read

### Reading Room (live)
- Real-time presence (who's reading right now)
- Live chat sidebar
- Timer/session tracking
- Ambient "reading together" feel

### Profile
- Reading stats (books completed, pages read, streaks)
- Club memberships
- Reading history
- **Post-launch:** Expand to Goodreads-style features (shelves: want to read / currently reading / read, ratings & reviews, reading challenges, year-in-review stats, friend activity)

### Discovery
- Browse public clubs by genre/book
- Search by book title or club name
- "Start a Club" flow

---

## Architecture & Tech Stack

```
┌─────────────────────────────────────────────┐
│              Next.js 14 (App Router)        │
│         TypeScript + Tailwind CSS           │
├────────────┬────────────┬───────────────────┤
│  Pages &   │  Server    │  Client           │
│  Layouts   │  Actions   │  Components       │
│  (RSC)     │ (mutations)│  (realtime state) │
└────────┬───┴─────┬──────┴────────┬──────────┘
         │         │               │
         ▼         ▼               ▼
┌─────────────────────────────────────────────┐
│              Supabase                        │
├──────────┬──────────┬───────────┬───────────┤
│   Auth   │ Postgres │ Realtime  │  Storage  │
│  (OAuth  │  (all    │ (progress │  (club    │
│  + email)│  tables) │  updates, │  avatars) │
│          │          │  chat)    │           │
└──────────┴──────────┴───────────┴───────────┘
         │
         ▼
┌─────────────────────┐
│  External APIs      │
│  - Open Library     │
│    (book metadata)  │
│  - Google Books     │
│    (fallback/covers)│
└─────────────────────┘
```

- **Auth:** Supabase Auth with email/password + Google OAuth
- **Realtime:** Supabase Realtime subscriptions for progress updates, reading room presence, and live chat
- **Book data:** Open Library API (free, no key needed) as primary, Google Books as fallback
- **Hosting:** Vercel (free tier to start)
- **Security:** Supabase Row Level Security (RLS) policies to enforce private club data visibility

---

## Error Handling & Edge Cases

### Reading progress
- Backward progress updates allowed with confirmation prompt
- Books without chapter data on API: club admin defines chapters manually

### Spoiler protection
- Discussion threads for unread chapters locked with "Read to Chapter X to unlock"
- Annotations from others only appear once viewer reaches that point

### Clubs
- No max club size at launch (add limits if needed)
- Admin departure: ownership transfers to longest-standing member
- Inactive clubs (90 days no activity) get a "Still reading?" nudge

### Auth & access
- Private club invite links expire after 7 days by default
- Public clubs: open join. Private clubs: invite link or admin approval
- Rate limiting on sign-up and API calls

### Book search
- Open Library → Google Books fallback chain
- Cache book metadata in Supabase to reduce API calls

---

## Testing Strategy

1. **RLS policy tests** (priority) — verify private club data isn't accessible to non-members
2. **E2E tests** (Playwright) — critical flows: sign up, create club, search book, update progress, post in discussion
3. **Unit tests** (Vitest) — utility functions: progress calculations, spoiler gating logic, book metadata parsing
4. **Component tests** (React Testing Library) — key UI: progress bar, discussion thread, club card

---

## Not in v1 (Post-launch)

- In-app book content / reader
- Push notifications
- Goodreads-style profile (shelves, ratings, reviews, challenges, year-in-review)
- Native mobile apps (iOS/Android)
- Book recommendation engine
