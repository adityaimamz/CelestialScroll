-- ==============================================================================
-- MIGRASI PENGUATAN KEAMANAN SISTEM (SECURITY HARDENING MIGRATION)
-- Tanggal: 4 September 2026
-- Referensi: SECURITY_ANALYSIS.md
-- ==============================================================================

-- 1. PERBAIKAN PII EMAIL & AKSES PROFIL (SEC-02)
-- ------------------------------------------------------------------------------
-- Hapus kolom email dari public.profiles agar data PII tidak terekspos via REST API
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Perbarui trigger registrasi user baru tanpa menyalin email ke public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = now();
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RAISE EXCEPTION 'Database error saving new user: %', SQLERRM;
END;
$$;

-- Izinkan publik (anon & authenticated) membaca profiles (username & avatar)
-- agar pengunjung non-login dapat melihat nama dan avatar pembuat komentar
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view basic profiles" ON public.profiles;
CREATE POLICY "Anyone can view basic profiles"
  ON public.profiles FOR SELECT
  USING (true);


-- 2. PERBAIKAN AKSES NOVEL & BAB BELUM RILIS / DRAFT (SEC-03)
-- ------------------------------------------------------------------------------
-- Pastikan novel unpublished hanya dapat dilihat oleh admin atau moderator
DROP POLICY IF EXISTS "Anyone can view novels" ON public.novels;
DROP POLICY IF EXISTS "Anyone can view published novels or staff view all" ON public.novels;
CREATE POLICY "Anyone can view published novels or staff view all"
  ON public.novels FOR SELECT
  USING (
    is_published = true 
    OR public.is_admin_or_moderator(auth.uid())
  );

-- Pastikan bab dari novel unpublished hanya dapat dilihat oleh admin atau moderator
DROP POLICY IF EXISTS "Anyone can view chapters" ON public.chapters;
DROP POLICY IF EXISTS "Anyone can view chapters of published novels or staff view all" ON public.chapters;
CREATE POLICY "Anyone can view chapters of published novels or staff view all"
  ON public.chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.novels
      WHERE novels.id = chapters.novel_id
        AND (novels.is_published = true OR public.is_admin_or_moderator(auth.uid()))
    )
  );


-- 3. PERBAIKAN VISIBILITAS LAPORAN KOMENTAR UNTUK ADMIN (SEC-07)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and mods can view all comment reports" ON public.comment_reports;
CREATE POLICY "Admins and mods can view all comment reports"
  ON public.comment_reports FOR SELECT
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

DROP POLICY IF EXISTS "Admins and mods can delete comment reports" ON public.comment_reports;
CREATE POLICY "Admins and mods can delete comment reports"
  ON public.comment_reports FOR DELETE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

DROP POLICY IF EXISTS "Admins and mods can update comment reports" ON public.comment_reports;
CREATE POLICY "Admins and mods can update comment reports"
  ON public.comment_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));


-- 4. PENGAMANAN SEARCH_PATH PADA SELURUH FUNGSI SECURITY DEFINER (SEC-06)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_novel_views(_novel_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.novels
  SET views = views + 1
  WHERE id = _novel_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_chapter_views(_chapter_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.chapters
  SET views = views + 1
  WHERE id = _chapter_id;

  INSERT INTO public.daily_site_views (date, views)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET views = daily_site_views.views + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_novel_bookmark_count(_novel_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT count(*)::INTEGER
  FROM public.bookmarks
  WHERE novel_id = _novel_id;
$$;

CREATE OR REPLACE FUNCTION public.update_novel_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.novels
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating_value), 2), 0)
    FROM public.novel_ratings
    WHERE novel_id = COALESCE(NEW.novel_id, OLD.novel_id)
  )
  WHERE id = COALESCE(NEW.novel_id, OLD.novel_id);
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.comments
    WHERE user_id = NEW.user_id
    AND created_at > now() - interval '10 seconds'
  ) THEN
    RAISE EXCEPTION 'Harap tunggu 10 detik sebelum mengirim komentar lagi.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    parent_comment_author_id UUID;
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        SELECT user_id INTO parent_comment_author_id
        FROM public.comments
        WHERE id = NEW.parent_id;

        IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.user_id THEN
            INSERT INTO public.notifications (user_id, actor_id, type, entity_id)
            VALUES (parent_comment_author_id, NEW.user_id, 'reply', NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_report_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    admin_record RECORD;
    notif_type TEXT;
BEGIN
    IF TG_TABLE_NAME = 'chapter_reports' THEN
        notif_type := 'admin_chapter_report';
    ELSIF TG_TABLE_NAME = 'comment_reports' THEN
        notif_type := 'admin_comment_report';
    ELSE
        RETURN NEW;
    END IF;

    FOR admin_record IN SELECT user_id FROM public.user_roles WHERE role = 'admin'
    LOOP
        INSERT INTO public.notifications (user_id, actor_id, type, entity_id, is_read)
        VALUES (admin_record.user_id, NEW.user_id, notif_type, NEW.id, FALSE);
    END LOOP;
    
    RETURN NEW;
END;
$$;


-- 5. RATE LIMITING PADA LAPORAN UNTUK MENCEGAH SPAM / NOTIF BOMB (SEC-09)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_report_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_TABLE_NAME = 'chapter_reports' THEN
    IF EXISTS (
      SELECT 1 FROM public.chapter_reports
      WHERE user_id = NEW.user_id
      AND created_at > now() - interval '30 seconds'
    ) THEN
      RAISE EXCEPTION 'Harap tunggu 30 detik sebelum membuat laporan bab baru.';
    END IF;
  ELSIF TG_TABLE_NAME = 'comment_reports' THEN
    IF EXISTS (
      SELECT 1 FROM public.comment_reports
      WHERE user_id = NEW.user_id
      AND created_at > now() - interval '30 seconds'
    ) THEN
      RAISE EXCEPTION 'Harap tunggu 30 detik sebelum membuat laporan komentar baru.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_rate_limit_chapter_reports ON public.chapter_reports;
CREATE TRIGGER tr_rate_limit_chapter_reports
  BEFORE INSERT ON public.chapter_reports
  FOR EACH ROW EXECUTE FUNCTION public.check_report_rate_limit();

DROP TRIGGER IF EXISTS tr_rate_limit_comment_reports ON public.comment_reports;
CREATE TRIGGER tr_rate_limit_comment_reports
  BEFORE INSERT ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION public.check_report_rate_limit();


-- 6. SAFEGUARD FUNGSI DELETE USER ACCOUNT (SEC-12)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  caller_id uuid := auth.uid();
  admin_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = caller_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF caller_id = target_user_id THEN
    RAISE EXCEPTION 'Admin tidak diperbolehkan menghapus akunnya sendiri.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = target_user_id AND role = 'admin'
  ) THEN
    SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Tidak dapat menghapus admin terakhir pada sistem.';
    END IF;
  END IF;

  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;


-- 7. DEFINISI FUNGSI GET_USERS_READING_COUNTS (INTEGRITAS FITUR BADGE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_users_reading_counts(user_ids uuid[])
RETURNS TABLE(user_id uuid, count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT reading_history.user_id, count(*)::bigint
  FROM public.reading_history
  WHERE reading_history.user_id = ANY(user_ids)
  GROUP BY reading_history.user_id;
$$;
