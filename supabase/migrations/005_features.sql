-- Profili arricchiti, like_count denormalizzato, social, notifiche, segnalazioni, download sicuri

alter table public.profiles
  add column if not exists bio text not null default '',
  add column if not exists avatar_url text not null default '',
  add column if not exists default_university text not null default '',
  add column if not exists is_admin boolean not null default false;

alter table public.notes
  add column if not exists academic_year text not null default '',
  add column if not exists semester text not null default '',
  add column if not exists faculty text not null default '',
  add column if not exists like_count integer not null default 0;

update public.notes n
set like_count = (
  select count(*)::integer from public.note_likes nl where nl.note_id = n.id
);

create or replace function public.sync_note_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.notes set like_count = like_count + 1 where id = new.note_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.notes
    set like_count = greatest(0, like_count - 1)
    where id = old.note_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists note_likes_count_sync on public.note_likes;
create trigger note_likes_count_sync
  after insert or delete on public.note_likes
  for each row
  execute function public.sync_note_like_count();

-- Preferiti
create table if not exists public.note_favorites (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (note_id, user_id)
);

create index if not exists note_favorites_user_idx on public.note_favorites (user_id, created_at desc);

alter table public.note_favorites enable row level security;

create policy "Favorites viewable by owner"
  on public.note_favorites for select
  using (auth.uid() = user_id);

create policy "Users can favorite"
  on public.note_favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can unfavorite"
  on public.note_favorites for delete
  using (auth.uid() = user_id);

-- Follow utenti
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists user_follows_follower_idx on public.user_follows (follower_id);
create index if not exists user_follows_following_idx on public.user_follows (following_id);

alter table public.user_follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.user_follows for select
  using (true);

create policy "Users can follow"
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.user_follows for delete
  using (auth.uid() = follower_id);

-- Notifiche in-app
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null default '',
  link text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can mark notifications read"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Segnalazioni contenuti
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  note_id uuid references public.notes (id) on delete set null,
  comment_id uuid references public.note_comments (id) on delete set null,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  check (note_id is not null or comment_id is not null)
);

create index if not exists content_reports_status_idx on public.content_reports (status, created_at desc);

alter table public.content_reports enable row level security;

create policy "Users can report"
  on public.content_reports for insert
  with check (auth.uid() = reporter_id);

create policy "Admins can view reports"
  on public.content_reports for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can update reports"
  on public.content_reports for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- Download tracciati (anti-abuso contatore)
create table if not exists public.note_downloads (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists note_downloads_dedupe_idx
  on public.note_downloads (note_id, user_id, created_at desc);

alter table public.note_downloads enable row level security;

create policy "Users see own downloads log"
  on public.note_downloads for select
  using (auth.uid() = user_id);

create policy "Users can log download"
  on public.note_downloads for insert
  with check (auth.uid() = user_id);

-- Rate limit generico (server actions)
create table if not exists public.action_rate_limits (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  action_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists action_rate_limits_lookup_idx
  on public.action_rate_limits (actor_id, action_key, created_at desc);

alter table public.action_rate_limits enable row level security;

create policy "Service role only for rate limits"
  on public.action_rate_limits for all
  using (false);

revoke all on public.action_rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(
  p_actor_id uuid,
  p_action_key text,
  p_max_count integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  delete from public.action_rate_limits
  where created_at < now() - make_interval(secs => p_window_seconds);

  select count(*)::integer into recent_count
  from public.action_rate_limits
  where actor_id = p_actor_id
    and action_key = p_action_key
    and created_at > now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_max_count then
    return false;
  end if;

  insert into public.action_rate_limits (actor_id, action_key)
  values (p_actor_id, p_action_key);

  return true;
end;
$$;

grant execute on function public.check_rate_limit (uuid, text, integer, integer) to authenticated;

-- Download: solo utenti autenticati, max 1 conteggio per utente/appunto ogni 24h
create or replace function public.increment_note_download(p_note_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  already_counted boolean;
begin
  if uid is null then
    return false;
  end if;

  if not public.check_rate_limit(uid, 'download:' || p_note_id::text, 5, 60) then
    return false;
  end if;

  select exists (
    select 1 from public.note_downloads
    where note_id = p_note_id
      and user_id = uid
      and created_at > now() - interval '24 hours'
  ) into already_counted;

  if already_counted then
    return false;
  end if;

  insert into public.note_downloads (note_id, user_id) values (p_note_id, uid);

  update public.notes
  set download_count = download_count + 1
  where id = p_note_id;

  return true;
end;
$$;

revoke execute on function public.increment_note_download (uuid) from anon;
grant execute on function public.increment_note_download (uuid) to authenticated;

-- Notifica helper
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_link text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user_id, p_type, p_title, p_body, p_link);
end;
$$;

-- Trigger: nuovo commento → notifica autore appunto
create or replace function public.notify_note_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  note_title text;
begin
  select user_id, title into owner_id, note_title
  from public.notes where id = new.note_id;

  if owner_id is not null and owner_id <> new.user_id then
    perform public.create_notification(
      owner_id,
      'comment',
      'Nuovo commento',
      'Qualcuno ha commentato: ' || note_title,
      '/appunti/' || new.note_id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_note_comment_notify on public.note_comments;
create trigger on_note_comment_notify
  after insert on public.note_comments
  for each row
  execute function public.notify_note_comment();

-- Trigger: nuovo like → notifica autore
create or replace function public.notify_note_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  note_title text;
begin
  select user_id, title into owner_id, note_title
  from public.notes where id = new.note_id;

  if owner_id is not null and owner_id <> new.user_id then
    perform public.create_notification(
      owner_id,
      'like',
      'Nuovo mi piace',
      'A qualcuno piace: ' || note_title,
      '/appunti/' || new.note_id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_note_like_notify on public.note_likes;
create trigger on_note_like_notify
  after insert on public.note_likes
  for each row
  execute function public.notify_note_like();

-- Trigger: nuovo follower
create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  follower_name text;
begin
  select coalesce(nullif(full_name, ''), username) into follower_name
  from public.profiles where id = new.follower_id;

  perform public.create_notification(
    new.following_id,
    'follow',
    'Nuovo follower',
    coalesce(follower_name, 'Un utente') || ' ha iniziato a seguirti',
    '/profilo/' || new.follower_id::text
  );
  return new;
end;
$$;

drop trigger if exists on_user_follow_notify on public.user_follows;
create trigger on_user_follow_notify
  after insert on public.user_follows
  for each row
  execute function public.notify_new_follower();
