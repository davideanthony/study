-- Testo estratto dai PDF + indice full-text (italiano)

alter table public.notes
  add column if not exists pdf_text text not null default '';

alter table public.notes
  add column if not exists fts tsvector generated always as (
    setweight(to_tsvector('italian', coalesce(title, '')), 'A')
    || setweight(to_tsvector('italian', coalesce(description, '')), 'B')
    || setweight(to_tsvector('italian', coalesce(course, '')), 'B')
    || setweight(to_tsvector('italian', coalesce(university, '')), 'C')
    || setweight(to_tsvector('italian', coalesce(faculty, '')), 'C')
    || setweight(to_tsvector('italian', coalesce(pdf_text, '')), 'D')
  ) stored;

create index if not exists notes_fts_gin on public.notes using gin (fts);

-- Ricerca full-text con filtri opzionali (chiamata da app se serve RPC)
create or replace function public.search_notes(
  p_query text default null,
  p_university text default null,
  p_course text default null,
  p_academic_year text default null,
  p_semester text default null,
  p_faculty text default null,
  p_sort text default 'recent',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  total_count bigint
)
language plpgsql
stable
set search_path = public
as $$
declare
  v_tsquery tsquery;
begin
  if p_query is not null and trim(p_query) <> '' then
    v_tsquery := websearch_to_tsquery('italian', trim(p_query));
  end if;

  return query
  with filtered as (
    select n.id
    from public.notes n
    where (v_tsquery is null or n.fts @@ v_tsquery)
      and (p_university is null or trim(p_university) = '' or n.university ilike '%' || trim(p_university) || '%')
      and (p_course is null or trim(p_course) = '' or n.course ilike '%' || trim(p_course) || '%')
      and (p_academic_year is null or trim(p_academic_year) = '' or n.academic_year = trim(p_academic_year))
      and (p_semester is null or trim(p_semester) = '' or n.semester = trim(p_semester))
      and (p_faculty is null or trim(p_faculty) = '' or n.faculty ilike '%' || trim(p_faculty) || '%')
  ),
  counted as (
    select count(*)::bigint as cnt from filtered
  )
  select f.id, c.cnt
  from filtered f
  cross join counted c
  order by
    case when p_sort = 'downloads' then (select download_count from notes where id = f.id) end desc nulls last,
    case when p_sort = 'likes' then (select like_count from notes where id = f.id) end desc nulls last,
    (select created_at from notes where id = f.id) desc
  limit p_limit
  offset p_offset;
end;
$$;

grant execute on function public.search_notes (text, text, text, text, text, text, text, integer, integer)
  to anon, authenticated;
