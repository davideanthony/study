-- Tag nel full-text search: colonna denormalizzata + trigger + FTS aggiornato

alter table public.notes
  add column if not exists tags_text text not null default '';

-- Backfill tag esistenti
update public.notes n
set tags_text = coalesce(
  (
    select string_agg(t.name, ' ' order by t.name)
    from public.note_tags nt
    join public.tags t on t.id = nt.tag_id
    where nt.note_id = n.id
  ),
  ''
);

create or replace function public.refresh_note_tags_text(p_note_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notes
  set tags_text = coalesce(
    (
      select string_agg(t.name, ' ' order by t.name)
      from public.note_tags nt
      join public.tags t on t.id = nt.tag_id
      where nt.note_id = p_note_id
    ),
    ''
  )
  where id = p_note_id;
end;
$$;

create or replace function public.trg_refresh_note_tags_text()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_note_tags_text(coalesce(new.note_id, old.note_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists note_tags_refresh_fts on public.note_tags;
create trigger note_tags_refresh_fts
  after insert or update or delete on public.note_tags
  for each row
  execute function public.trg_refresh_note_tags_text();

-- Ricrea FTS includendo tags_text (peso B, come descrizione/corso)
drop index if exists public.notes_fts_gin;

alter table public.notes drop column if exists fts;

alter table public.notes
  add column fts tsvector generated always as (
    setweight(to_tsvector('italian', coalesce(title, '')), 'A')
    || setweight(to_tsvector('italian', coalesce(description, '')), 'B')
    || setweight(to_tsvector('italian', coalesce(tags_text, '')), 'B')
    || setweight(to_tsvector('italian', coalesce(course, '')), 'B')
    || setweight(to_tsvector('italian', coalesce(university, '')), 'C')
    || setweight(to_tsvector('italian', coalesce(faculty, '')), 'C')
    || setweight(to_tsvector('italian', coalesce(pdf_text, '')), 'D')
  ) stored;

create index notes_fts_gin on public.notes using gin (fts);

-- Tag più usati (per suggerimenti UI)
create or replace function public.get_popular_tags(p_limit integer default 12)
returns table (name text, usage_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select t.name, count(*)::bigint as usage_count
  from public.tags t
  inner join public.note_tags nt on nt.tag_id = t.id
  group by t.id, t.name
  order by usage_count desc, t.name asc
  limit greatest(1, least(coalesce(p_limit, 12), 30));
$$;

grant execute on function public.get_popular_tags (integer) to anon, authenticated;
