# TurnTogether — Claude Code Instructions

## Stack
Next.js 16.1.6 + React 19 + Supabase + Tailwind CSS 4 + Zod v4 + Vitest

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (must pass before merging)
- `npm run test:run` — run all tests
- `npx supabase db push --linked` — push migrations to remote Supabase

## Conventions
- Server actions: `actions.ts` in route directory, return `{ error }` or `{ success }`, never throw
- Actions using `useActionState` must accept `(_prevState, formData)` signature
- Client form wrappers: separate `*-form.tsx` or `*-client.tsx` files
- Validation schemas: `src/lib/validations.ts` (Zod v4 — uses `.issues` not `.errors`)
- URL params are strings — `Number(id)` before passing to Supabase `.eq()` calls
- Database types: manual `Database` interface at `src/lib/supabase/database.types.ts`

## Supabase RLS Rules (CRITICAL)

These rules exist because we hit real bugs. Do not skip them.

### 1. INSERT + `.select()` requires a SELECT policy
Supabase's `.insert().select().single()` uses `INSERT ... RETURNING *`. PostgreSQL checks **SELECT** policies on the returned row. If no SELECT policy matches the new row, the INSERT **appears to fail** with an RLS error even though the INSERT policy passed.

**Fix:** Ensure the inserting user can always SELECT their own row:
```sql
create policy "Creators can view own X"
  on X for select to authenticated
  using (created_by = (select auth.uid()));
```

### 2. NEVER use direct cross-table subqueries in RLS policies
If table A's policy does `exists (select from B)` and table B's policy does `exists (select from A)`, PostgreSQL raises **"infinite recursion detected"** at planning time.

**Fix:** Wrap ALL cross-table checks in `SECURITY DEFINER plpgsql` functions:
```sql
create or replace function my_check(p_id bigint)
returns boolean as $$
begin
  return exists (select 1 from other_table where id = p_id);
end;
$$ language plpgsql security definer stable;
```

- **Must be `plpgsql`** — SQL functions can be inlined by the planner, defeating the purpose
- **Must be `security definer`** — bypasses RLS inside the function, breaking the cycle
- **Must be `stable`** — allows caching within a statement

### 3. Existing helper functions (use these, don't reinvent)
| Function | Checks |
|----------|--------|
| `is_club_member(club_id)` | Is current user a member of this club? |
| `is_club_admin(club_id)` | Is current user an admin of this club? |
| `is_public_club(club_id)` | Is this club public? |

Use these in new RLS policies instead of writing inline subqueries.
