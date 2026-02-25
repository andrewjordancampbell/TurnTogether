-- Temporary diagnostic function to check auth.uid()
create or replace function public.debug_auth_uid()
returns json as $$
  select json_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'session_user', session_user
  );
$$ language sql security invoker;
