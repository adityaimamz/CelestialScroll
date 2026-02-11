-- Create a function to delete a user from auth.users
-- This function must be called with a service role or be a security definer function
-- callable by admin/moderator roles if RLS allows.

create or replace function delete_user_account(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if the executing user is an admin (optional security check)
  -- For now, we rely on RLS execution privileges or client-side checks + RLS on the function if needed.
  -- Better: Check if the caller has 'admin' role in public.user_roles
  
  if not exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Delete from auth.users
  delete from auth.users where id = target_user_id;
end;
$$;
