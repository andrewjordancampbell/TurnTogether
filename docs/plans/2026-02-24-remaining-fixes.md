# TurnTogether — Remaining Fixes from Code Review

**Goal:** Fix the 8 bugs introduced during the P0/P1/P2 fix run. These are all that stand between the app and a working launch state.

**Run after every fix:** `npm run test:run && npm run build`

---

## Critical (must fix before launch)

### Fix A: Missing RLS DELETE policies

**Problem:** `clubs` and `chapters` tables have no DELETE RLS policies. The `createClub` rollback and `deleteChapter` action both silently fail.

**Fix:** Create `supabase/migrations/004_missing_rls_policies.sql`:
```sql
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
```

This single migration fixes all three missing RLS policies (clubs DELETE, chapters DELETE, books UPDATE).

### Fix B: Login does not forward `next` query param

**Problem:** The invite page links to `/login?next=/invite/{code}`, but after email/password login the user always lands on `/dashboard`. The `next` param is ignored.

**Fix in `src/app/login/page.tsx`:**
- Read `next` from `searchParams`
- Pass it as a hidden field in the login form

**Fix in `src/app/login/actions.ts`:**
- Read `next` from `formData`
- If `next` exists and starts with `/` (not `//`), redirect there instead of `/dashboard`
- Same open-redirect protection as the OAuth callback

---

## Moderate (should fix soon)

### Fix C: `deleteChapter` has no Zod validation or error feedback

**Problem:** `deleteChapter` in `src/app/clubs/[id]/chapters/actions.ts` reads formData without validation and has no error feedback mechanism.

**Fix:**
- Add a `deleteChapterSchema` to `src/lib/validations.ts`
- Validate inputs in `deleteChapter`
- Change `deleteChapter` to accept `(_prevState, formData)` signature for `useActionState`
- Update the chapters page to use `useActionState` for the delete form so errors display

### Fix D: Move chapter schema to validations.ts

**Problem:** `chapterSchema` is defined inline in `src/app/clubs/[id]/chapters/actions.ts` instead of in `src/lib/validations.ts` with all other schemas.

**Fix:** Move the schema to `src/lib/validations.ts` and import it in the actions file.

### Fix E: Remove `any` types from dashboard

**Problem:** `src/app/dashboard/page.tsx` lines 24 and 47 use `any` with eslint-disable comments.

**Fix:** Create a proper type derived from the `Database` interface for the club membership join result. Remove the eslint-disable comments.

### Fix F: Add comment pagination

**Problem:** Discussion detail page (`src/app/clubs/[id]/discussions/[discussionId]/page.tsx`) loads all comments without pagination. Discussions and discover have pagination, but comments do not.

**Fix:** Add the same offset-based pagination pattern used in discover/discussions pages.

### Fix G: Fix ProgressUpdater totalPages conditional

**Problem:** In `src/components/progress-updater.tsx`, `{totalPages && <input ... />}` renders `0` to the DOM when `totalPages` is `0` because `0` is falsy but React renders it.

**Fix:** Change to `{totalPages != null && totalPages > 0 && <input ... />}`

### Fix H: Public club member count not visible to unauthenticated users

**Problem:** The `club_members` SELECT RLS policy requires authentication and membership. Unauthenticated users viewing a public club cannot see member count.

**Fix:** Add a policy to `supabase/migrations/004_missing_rls_policies.sql`:
```sql
-- Anyone can see member count of public clubs
create policy "Public club members visible to everyone"
  on club_members for select
  using (
    exists (
      select 1 from clubs
      where clubs.id = club_members.club_id
        and clubs.is_public = true
    )
  );
```

---

## Verification

After all fixes:
1. [ ] Create a club — admin role is set, rollback works if it fails
2. [ ] Delete a chapter — actually deletes
3. [ ] Set a book that already exists — upsert succeeds
4. [ ] Click invite link while logged out — log in — land back on invite page
5. [ ] View public club while logged out — member count visible
6. [ ] Discussion with 25+ comments — pagination works
7. [ ] `npm run test:run` — all tests pass
8. [ ] `npm run build` — zero errors
