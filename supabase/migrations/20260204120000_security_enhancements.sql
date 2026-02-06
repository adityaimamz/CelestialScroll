-- 1. Rate Limiting for Comments
-- Prevent users from posting more than one comment every 10 seconds
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user has posted a comment in the last 10 seconds
  IF EXISTS (
    SELECT 1 FROM public.comments
    WHERE user_id = NEW.user_id
    AND created_at > now() - interval '10 seconds'
  ) THEN
    RAISE EXCEPTION 'Harap tunggu 10 detik sebelum mengirim komentar lagi.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS check_comment_rate_limit_trigger ON public.comments;
CREATE TRIGGER check_comment_rate_limit_trigger
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_comment_rate_limit();


-- 2. Data Constraints for Novels
-- Ensure titles have reasonable length 
ALTER TABLE public.novels
DROP CONSTRAINT IF EXISTS title_length_check;

ALTER TABLE public.novels
ADD CONSTRAINT title_length_check CHECK (char_length(trim(title)) >= 3);

ALTER TABLE public.novels
DROP CONSTRAINT IF EXISTS slug_format_check;

ALTER TABLE public.novels
ADD CONSTRAINT slug_format_check CHECK (slug ~ '^[a-z0-9-]+$');
