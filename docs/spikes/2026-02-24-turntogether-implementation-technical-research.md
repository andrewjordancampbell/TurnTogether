# Investigation Spike: TurnTogether Technical Implementation

## Scope
Implement the full TurnTogether plan (`docs/plans/2026-02-24-turntogether-implementation.md`) across 16 tasks and 6 phases using:
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Realtime, Storage)

Focus:
- Architecture design
- Security
- Performance
- User experience

## Executive Technical Direction
Use a server-first architecture:
- Read paths: Server Components + typed query helpers
- Write paths: Server Actions with validation + authorization + idempotency
- Trust boundary: Supabase RLS as final enforcement layer
- Live features: Supabase Realtime channels for presence/chat; DB-backed subscriptions for durable state

Key implementation principle:
- Treat browser input as untrusted; every mutation validates payload and relies on RLS/RPC constraints.

## Recommended Project Structure
```text
src/
  app/
    (marketing)/
    (auth)/login
    (auth)/signup
    (app)/dashboard
    (app)/clubs/[id]
    (app)/books/search
  components/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    db/
      queries/
      mutations/
    validation/
      auth.ts
      clubs.ts
      discussions.ts
      progress.ts
    books/
      open-library.ts
      google-books.ts
      mapper.ts
  types/
    database.ts
supabase/
  migrations/
```

Why:
- Keeps route handlers thin and testable.
- Centralizes data/validation logic.
- Makes policy-driven refactors easier.

## Phase-by-Phase Implementation Analysis

## Phase 1: Scaffolding + Auth (Tasks 1-3)

### Patterns
- Use `@supabase/ssr` split clients (`createBrowserClient`, `createServerClient`).
- Use middleware only for session refresh and route gating.
- Use Server Actions for login/signup to avoid separate API route boilerplate.
- Use `zod` for all form payload parsing in actions.

### Libraries
- Add: `zod`, `@hookform/resolvers` (optional if using React Hook Form later), `pino` or lightweight logger.
- Keep: Vitest + RTL + Playwright.

### Trade-offs
- Server Actions simplify mutation flows, but make explicit API versioning harder.
- Middleware auth checks improve UX but add request overhead on every matched route.

### Security decisions
- Enforce strict origin checks in OAuth callback (`next` param allowlist; no open redirects).
- Add rate limits/captcha for signup/login (Supabase bot protection + edge middleware/IP throttling).
- Prefer `NEXT_PUBLIC_SITE_URL` only for approved redirect construction.

### UX decisions
- Return structured action errors and render inline field-level feedback.
- Keep auth forms resilient with pending states and disabled submit buttons.

## Phase 2: Database Schema + RLS (Tasks 4-5)

### Patterns
- Use explicit constraints and check clauses in schema:
  - `percent_complete between 0 and 100`
  - non-negative chapter/page fields
  - unique discussion title per chapter optional for dedupe
- Add `updated_at` triggers instead of setting timestamps in every action.
- Prefer small Postgres functions for multi-step invariants.

### Critical schema refinements
- Add table for durable room chat if message history matters:
  - `reading_room_messages (room_id, author_id, content, created_at)`.
- Add membership lifecycle fields:
  - `status`, `left_at`, `removed_at` for auditability.
- Add invite table instead of static invite code only:
  - expiring links, optional usage count, revoke support.

### RLS hardening
- Use helper functions with `security definer` carefully and fixed `search_path`.
- Add `WITH CHECK` policies for update operations where missing.
- Enforce spoiler gating at DB layer for discussion/comment reads where possible.
- Create policy test matrix (member, non-member, admin, public user).

### Trade-offs
- Richer RLS reduces app complexity but increases SQL maintenance cost.
- DB-level spoiler rules provide stronger guarantees, but are harder to evolve quickly.

### Performance decisions
- Add indexes for top queries:
  - `reading_progress (club_id, updated_at desc)`
  - `comments (discussion_id, created_at)`
  - `discussions (club_id, created_at desc)`
- Consider partial indexes for public discovery (`clubs where is_public=true`).

## Phase 3: Book Search API (Task 6)

### Patterns
- Adapter pattern:
  - `searchProvider -> normalized result`.
- Implement provider fallback chain:
  - Open Library primary, Google Books fallback.
- Cache normalized metadata in `books` table with stale-while-revalidate behavior.

### Performance decisions
- Debounce search input client-side (250-400ms).
- Route search through server action/route to hide provider details and apply caching.
- Use Next fetch caching tags for repeated queries where useful.

### Security decisions
- Keep external API calls server-side if quota keys are introduced later.
- Sanitize/normalize provider payload fields before persistence.

### Trade-offs
- Client-side direct calls are simple but reduce control over throttling/cache.
- Server-side broker adds latency but improves observability and resilience.

## Phase 4: Core Features (Tasks 7-13)

### Task 7 (Search page)
- Pattern: client search shell + server-backed query.
- UX: optimistic loading, empty-state messaging, keyboard-first result navigation.

### Task 8 (Club create/detail)
- Pattern: transactional creation.
- Use a Postgres RPC or SQL transaction for:
  - create club
  - insert creator membership (admin)
- Avoid partial failure where club exists without admin membership.

### Task 9 (Dashboard)
- Pattern: aggregate queries in one server read model.
- Use dedicated SQL view/RPC for dashboard card payload instead of nested ad hoc selects.

### Task 10 (Progress)
- Pattern: idempotent upsert with monotonic validation option.
- Add optional confirmation flow for backwards progress updates.
- Add anti-spam write throttling (e.g., min interval for repeated identical updates).

### Task 11 (Discussions/comments)
- Pattern: command/query separation.
- Commands in actions; reads in server components with pagination.
- Add spoiler gate checks before insert and select to enforce chapter progression rules.

### Task 12 (Discovery)
- Pattern: public read model with capped payload.
- Add pagination cursor, not just `limit 20`.

### Task 13 (Navigation)
- Pattern: auth-aware nav in server component.
- Use `next/link` everywhere; avoid plain `<a>` for internal navigation.

### UX decisions across core features
- Mobile-first layout for club and discussion screens.
- Skeleton loaders for heavy server responses.
- Explicit empty states for clubs, discussions, progress.

## Phase 5: Realtime (Task 14)

### Patterns
- Use one persistent room channel instance per component lifecycle.
- Do not create a new channel in `sendMessage`; reuse subscribed channel reference.
- Presence for ephemeral "who is online".
- DB-backed messages for durable chat history + realtime subscription to inserts.

### Security decisions
- Realtime authorization inherits RLS from underlying tables for DB events.
- For broadcast channels, enforce membership checks before joining/sending.

### Performance decisions
- Cap in-memory message list and virtualize if history is long.
- Batch presence updates and avoid frequent re-subscribe churn.

### Trade-offs
- Broadcast-only chat is low latency but non-durable.
- DB-backed chat is durable/searchable but higher write/read cost.

## Phase 6: Polish + Deploy (Tasks 15-16)

### Patterns
- Profile page should use pre-aggregated stats query or materialized view for scale.
- Deploy with environment parity:
  - local/dev/prod Supabase projects
  - explicit redirect URL config per environment

### Security decisions
- Ensure production URL allowlists in Supabase Auth config are exact.
- Rotate keys and set incident playbook for leaked anon/service keys.

### Performance decisions
- Use Vercel caching headers for public discovery pages if allowed by auth context.
- Add basic observability (request logs + error tracking).

## Cross-Cutting Security Architecture
- Authentication: Supabase JWT session via `@supabase/ssr`.
- Authorization: RLS-first, app checks second.
- Validation: `zod` in every action before DB write.
- Sensitive operations:
  - `SECURITY DEFINER` functions reviewed and minimal.
  - service role key never used in client bundles.
- Abuse controls:
  - rate limit signup/login/search/discussion posting.
  - optional profanity/abuse filter pipeline for user-generated content.

## Cross-Cutting Performance Architecture
- Prefer server components for initial reads.
- Keep client components narrowly interactive.
- Add pagination for discussions/comments/discovery early.
- Cache external metadata aggressively with invalidation strategy.
- Use selective realtime subscriptions (club-scoped channels only).

## Cross-Cutting UX Architecture
- Preserve user context after actions (redirect back with flash state).
- Real-time indicators should degrade gracefully when disconnected.
- Spoiler locks must explain "why locked" and how to unlock.
- Keep progress updates one-tap on mobile.

## Testing Strategy (Implementation-Ready)
- Unit: parsing, progress math, spoiler gating predicates.
- Integration: server actions against test DB (happy + permission denied).
- RLS: SQL policy tests for each role scenario.
- E2E: auth, club lifecycle, progress update, discussion flow, live room join/chat.
- Realtime: deterministic component tests with mocked channel events.

## Primary Risks and Mitigations
- Risk: partial writes in club creation.
  - Mitigation: RPC transaction.
- Risk: policy gaps leak private data.
  - Mitigation: deny-by-default RLS + test matrix.
- Risk: realtime chat not durable.
  - Mitigation: persist messages in table and subscribe to inserts.
- Risk: provider instability/rate limits.
  - Mitigation: fallback provider + cache + retry budget.

## Suggested Implementation Order (within existing phases)
1. Scaffold + auth + validation baseline.
2. Schema + hardened RLS + policy tests.
3. Book search adapters + cache.
4. Clubs/dashboard/progress/discussions with pagination and spoiler guards.
5. Realtime room with durable messages.
6. Profile aggregates, deployment, observability.

## Keep vs Adjust from Current Plan
Keep:
- Next.js App Router + Supabase architecture.
- Server Actions for writes.
- RLS-centric security model.

Adjust:
- Add schema constraints and transactional RPCs.
- Replace broadcast-only chat with DB-backed durable chat.
- Add validation and anti-abuse controls as first-class concerns.
- Add pagination and query shaping before launch to avoid early regressions.
