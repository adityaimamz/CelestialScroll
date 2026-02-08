-- Create chapter_reports table
CREATE TABLE public.chapter_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_text TEXT NOT NULL CHECK (char_length(report_text) > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;

-- Policies

-- Authenticated users can insert their own reports
CREATE POLICY "Authenticated users can report chapters"
  ON public.chapter_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own reports (optional, but good for history if we add it later)
CREATE POLICY "Users can view own chapter reports"
  ON public.chapter_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins/Moderators can view all reports
CREATE POLICY "Admins/Mods can view all chapter reports"
  ON public.chapter_reports FOR SELECT
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Admins/Moderators can update reports (e.g. change status)
CREATE POLICY "Admins/Mods can update chapter reports"
  ON public.chapter_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Admins/Moderators can delete reports
CREATE POLICY "Admins/Mods can delete chapter reports"
  ON public.chapter_reports FOR DELETE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- Grant permissions
GRANT ALL ON public.chapter_reports TO authenticated;
GRANT ALL ON public.chapter_reports TO service_role;
