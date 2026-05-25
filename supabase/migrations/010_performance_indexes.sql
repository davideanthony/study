-- Indici per filtri ILIKE (università, corso, facoltà) usati in /cerca
-- Esegui in Supabase SQL Editor dopo le migration 001–009.

create extension if not exists pg_trgm;

create index if not exists notes_university_trgm_idx
  on public.notes using gin (university gin_trgm_ops);

create index if not exists notes_course_trgm_idx
  on public.notes using gin (course gin_trgm_ops);

create index if not exists notes_faculty_trgm_idx
  on public.notes using gin (faculty gin_trgm_ops);

-- Ordinamenti frequenti in lista
create index if not exists notes_download_count_idx
  on public.notes (download_count desc);

create index if not exists notes_like_count_idx
  on public.notes (like_count desc);
