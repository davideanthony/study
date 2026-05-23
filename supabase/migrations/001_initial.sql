-- Stufy MVP schema

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text default '' not null,
  created_at timestamptz default now() not null
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  course text not null,
  university text not null,
  description text default '' not null,
  file_path text not null,
  file_name text not null,
  download_count integer default 0 not null,
  created_at timestamptz default now() not null
);

create index notes_university_idx on public.notes (university);
create index notes_course_idx on public.notes (course);
create index notes_created_at_idx on public.notes (created_at desc);

create table public.note_likes (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz default now() not null,
  unique (note_id, user_id)
);

create table public.note_ratings (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  created_at timestamptz default now() not null,
  unique (note_id, user_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.note_likes enable row level security;
alter table public.note_ratings enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Notes are viewable by everyone"
  on public.notes for select
  using (true);

create policy "Authenticated users can insert notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

create policy "Likes are viewable by everyone"
  on public.note_likes for select
  using (true);

create policy "Users can like"
  on public.note_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own"
  on public.note_likes for delete
  using (auth.uid() = user_id);

create policy "Ratings are viewable by everyone"
  on public.note_ratings for select
  using (true);

create policy "Users can rate"
  on public.note_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rating"
  on public.note_ratings for update
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('notes', 'notes', true)
on conflict (id) do nothing;

create policy "Anyone can read note PDFs"
  on storage.objects for select
  using (bucket_id = 'notes');

create policy "Authenticated users can upload PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'notes'
    and auth.role() = 'authenticated'
  );

create policy "Users can delete own PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'notes'
    and auth.uid()::text = (storage.foldername (name))[1]
  );
