-- Create Announcements table
create table "public"."announcements" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "content" text not null,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now()
);

alter table "public"."announcements" enable row level security;

create policy "Enable read for public"
on "public"."announcements"
as permissive
for select
to public
using (true);

create policy "Enable all for admin"
on "public"."announcements"
as permissive
for all
to public
using (auth.uid() in (select user_id from user_roles where role = 'admin'));


-- Create Genres table
create table "public"."genres" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default now()
);

CREATE UNIQUE INDEX genres_pkey ON public.genres USING btree (id);
CREATE UNIQUE INDEX genres_slug_key ON public.genres USING btree (slug);

alter table "public"."genres" add constraint "genres_pkey" PRIMARY KEY using index "genres_pkey";
alter table "public"."genres" add constraint "genres_slug_key" UNIQUE using index "genres_slug_key";

alter table "public"."genres" enable row level security;

create policy "Enable read for public"
on "public"."genres"
as permissive
for select
to public
using (true);

create policy "Enable all for admin"
on "public"."genres"
as permissive
for all
to public
using (auth.uid() in (select user_id from user_roles where role = 'admin'));


-- Create Novel Genres junction table
create table "public"."novel_genres" (
    "novel_id" uuid not null,
    "genre_id" uuid not null 
);

CREATE UNIQUE INDEX novel_genres_pkey ON public.novel_genres USING btree (novel_id, genre_id);

alter table "public"."novel_genres" add constraint "novel_genres_pkey" PRIMARY KEY using index "novel_genres_pkey";

alter table "public"."novel_genres" add constraint "novel_genres_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE not valid;
alter table "public"."novel_genres" validate constraint "novel_genres_genre_id_fkey";

alter table "public"."novel_genres" add constraint "novel_genres_novel_id_fkey" FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE not valid;
alter table "public"."novel_genres" validate constraint "novel_genres_novel_id_fkey";

alter table "public"."novel_genres" enable row level security;

create policy "Enable read for public"
on "public"."novel_genres"
as permissive
for select
to public
using (true);

create policy "Enable all for admin"
on "public"."novel_genres"
as permissive
for all
to public
using (auth.uid() in (select user_id from user_roles where role = 'admin'));
