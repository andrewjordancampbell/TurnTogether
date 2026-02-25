-- Detailed RLS diagnostic function
create or replace function public.debug_rls_clubs(p_name text, p_created_by uuid)
returns json as $$
declare
  v_result json;
  v_policy_count int;
  v_policy_info json;
begin
  -- Get policy info for clubs table
  select count(*) into v_policy_count
  from pg_policies where tablename = 'clubs' and schemaname = 'public';

  select json_agg(json_build_object(
    'name', policyname,
    'permissive', permissive,
    'roles', roles,
    'cmd', cmd,
    'qual', qual::text,
    'with_check', with_check::text
  )) into v_policy_info
  from pg_policies where tablename = 'clubs' and schemaname = 'public';

  -- Check RLS enabled
  v_result := json_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'p_created_by', p_created_by,
    'uid_matches_created_by', (auth.uid() = p_created_by),
    'uid_type', pg_typeof(auth.uid())::text,
    'policy_count', v_policy_count,
    'policies', v_policy_info,
    'rls_enabled', (select relrowsecurity from pg_class where relname = 'clubs' and relnamespace = (select oid from pg_namespace where nspname = 'public'))
  );

  return v_result;
end;
$$ language plpgsql security invoker;
