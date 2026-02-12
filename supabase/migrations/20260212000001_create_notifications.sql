-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The recipient
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- The user who triggered the notification
    type TEXT NOT NULL CHECK (type IN ('reply', 'like', 'system')),
    entity_id UUID, -- ID of the related entity (e.g., comment_id)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to handle new comment notifications
CREATE OR REPLACE FUNCTION public.handle_new_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    parent_comment_author_id UUID;
BEGIN
    -- Check if it's a reply (parent_id is not null)
    IF NEW.parent_id IS NOT NULL THEN
        -- Get the author of the parent comment
        SELECT user_id INTO parent_comment_author_id
        FROM public.comments
        WHERE id = NEW.parent_id;

        -- If parent comment exists and author is not the same as the replier
        IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.user_id THEN
            INSERT INTO public.notifications (user_id, actor_id, type, entity_id)
            VALUES (parent_comment_author_id, NEW.user_id, 'reply', NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_comment_notification();
