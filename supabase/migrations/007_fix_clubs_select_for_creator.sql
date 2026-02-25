-- Fix: Club creators can see their own clubs immediately after creation.
-- Without this, the INSERT ... RETURNING * (used by .select().single())
-- fails because the creator isn't in club_members yet, so the existing
-- SELECT policies block the RETURNING clause.
create policy "Club creators can view own clubs"
  on clubs for select to authenticated
  using (created_by = (select auth.uid()));

-- Clean up temporary debug functions
drop function if exists public.debug_auth_uid();
drop function if exists public.debug_rls_clubs(text, uuid);
