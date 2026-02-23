-- Menambahkan kolom language pada tabel chapters
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'id' CHECK (language IN ('id', 'en'));
