
DROP POLICY IF EXISTS "Users can delete their own wines" ON public.wines;
DROP POLICY IF EXISTS "Users can insert their own wines" ON public.wines;
DROP POLICY IF EXISTS "Users can update their own wines" ON public.wines;
DROP POLICY IF EXISTS "Users can view their own wines" ON public.wines;

CREATE POLICY "Users can view their own wines" ON public.wines
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wines" ON public.wines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wines" ON public.wines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wines" ON public.wines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
