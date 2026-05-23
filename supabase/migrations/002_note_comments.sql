-- Commenti sugli appunti

create table public.note_comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (
    char_length(trim(body)) >= 1
    and char_length(body) <= 2000
  ),
  created_at timestamptz default now() not null
);

create index note_comments_note_id_idx on public.note_comments (note_id, created_at asc);

alter table public.note_comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.note_comments for select
  using (true);

create policy "Authenticated users can comment"
  on public.note_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.note_comments for delete
  using (auth.uid() = user_id);
