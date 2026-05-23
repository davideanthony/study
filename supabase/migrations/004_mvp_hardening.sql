-- Rimuovi voti (solo like/cuori), storage sicuro, contatore download

drop policy if exists "Ratings are viewable by everyone" on public.note_ratings;
drop policy if exists "Users can rate" on public.note_ratings;
drop policy if exists "Users can update own rating" on public.note_ratings;

drop table if exists public.note_ratings;

drop policy if exists "Authenticated users can upload PDFs" on storage.objects;

create policy "Authenticated users can upload own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'notes'
    and auth.role() = 'authenticated'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create or replace function public.increment_note_download(p_note_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notes
  set download_count = download_count + 1
  where id = p_note_id;
end;
$$;

grant execute on function public.increment_note_download (uuid) to anon, authenticated;
