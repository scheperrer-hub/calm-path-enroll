-- Update profiles table policy to restrict access to own profile or admin/leader
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR is_admin_or_leader(auth.uid()));