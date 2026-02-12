-- Drop existing Foreign Keys
ALTER TABLE public.notifications
DROP CONSTRAINT notifications_user_id_fkey,
DROP CONSTRAINT notifications_actor_id_fkey;

-- Add new Foreign Keys referencing public.profiles
-- We assume public.profiles.id exists and matches auth.users.id
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT notifications_actor_id_fkey
FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
