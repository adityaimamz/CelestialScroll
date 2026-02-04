-- Migration to enhance Comments feature with Replies, Votes, and Reports

-- 1. Add parent_id to comments for nesting
ALTER TABLE public.comments 
ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Create Comment Votes Table
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- 3. Create Comment Reports Table
CREATE TABLE public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Votes

-- Everyone can view votes (to calculate counts)
CREATE POLICY "Anyone can view comment votes" 
ON public.comment_votes FOR SELECT 
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" 
ON public.comment_votes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes" 
ON public.comment_votes FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" 
ON public.comment_votes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. RLS Policies for Reports

-- Authenticated users can report
CREATE POLICY "Authenticated users can report" 
ON public.comment_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Only admins/moderators can view reports (Assuming they have role check access or service role)
-- For now, we restrict standard user access to select
CREATE POLICY "Users can view own reports" 
ON public.comment_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);


-- 7. Grant Permissions
GRANT ALL ON public.comment_votes TO authenticated;
GRANT ALL ON public.comment_reports TO authenticated;
GRANT SELECT ON public.comment_votes TO service_role;
GRANT SELECT ON public.comment_reports TO service_role;
GRANT ALL ON public.comment_votes TO service_role;
GRANT ALL ON public.comment_reports TO service_role;
