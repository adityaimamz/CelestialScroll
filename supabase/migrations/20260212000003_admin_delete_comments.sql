-- Allow admins to delete any comment
-- Using the existing has_role function which is SECURITY DEFINER and checks user_roles table

CREATE POLICY "Admins can delete comments"
ON public.comments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
