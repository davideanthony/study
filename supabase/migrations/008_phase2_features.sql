-- Fase 2: block, tag, moderazione commenti, versioni PDF, messaggi DM

-- ---------------------------------------------------------------------------
-- Blocco utenti
-- ---------------------------------------------------------------------------
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists user_blocks_blocker_idx on public.user_blocks (blocker_id);
create index if not exists user_blocks_blocked_idx on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

create policy "Users see own blocks"
  on public.user_blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can block"
  on public.user_blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Users can unblock"
  on public.user_blocks for delete
  using (auth.uid() = blocker_id);

create or replace function public.is_blocked(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = p_user_a and blocked_id = p_user_b)
       or (blocker_id = p_user_b and blocked_id = p_user_a)
  );
$$;

grant execute on function public.is_blocked (uuid, uuid) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Tag appunti
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_name_len check (char_length(name) >= 1 and char_length(name) <= 40)
);

create unique index if not exists tags_name_lower_idx on public.tags (lower(name));

create table if not exists public.note_tags (
  note_id uuid not null references public.notes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (note_id, tag_id)
);

create index if not exists note_tags_tag_idx on public.note_tags (tag_id);

alter table public.tags enable row level security;
alter table public.note_tags enable row level security;

create policy "Tags are viewable by everyone"
  on public.tags for select
  using (true);

create policy "Note tags are viewable by everyone"
  on public.note_tags for select
  using (true);

create policy "Note owners manage note tags"
  on public.note_tags for insert
  with check (
    exists (
      select 1 from public.notes n
      where n.id = note_id and n.user_id = auth.uid()
    )
  );

create policy "Note owners delete note tags"
  on public.note_tags for delete
  using (
    exists (
      select 1 from public.notes n
      where n.id = note_id and n.user_id = auth.uid()
    )
  );

create policy "Authenticated users create tags"
  on public.tags for insert
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Moderazione commenti
-- ---------------------------------------------------------------------------
alter table public.note_comments
  add column if not exists hidden_at timestamptz,
  add column if not exists hidden_by uuid references public.profiles (id) on delete set null;

drop policy if exists "Comments are viewable by everyone" on public.note_comments;

create policy "Comments visible unless hidden"
  on public.note_comments for select
  using (
    hidden_at is null
    or user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "Admins can hide comments"
  on public.note_comments for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- Versioni PDF
-- ---------------------------------------------------------------------------
alter table public.notes
  add column if not exists version_number integer not null default 1;

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  version_number integer not null,
  file_path text not null,
  file_name text not null,
  pdf_text text not null default '',
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (note_id, version_number)
);

create index if not exists note_versions_note_idx
  on public.note_versions (note_id, version_number desc);

alter table public.note_versions enable row level security;

create policy "Note versions viewable by everyone"
  on public.note_versions for select
  using (true);

create policy "Note owners insert versions"
  on public.note_versions for insert
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from public.notes n
      where n.id = note_id and n.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Messaggi diretti (DM)
-- ---------------------------------------------------------------------------
create table if not exists public.dm_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles (id) on delete cascade,
  participant_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (participant_a, participant_b),
  check (participant_a < participant_b)
);

create index if not exists dm_conversations_a_idx on public.dm_conversations (participant_a, updated_at desc);
create index if not exists dm_conversations_b_idx on public.dm_conversations (participant_b, updated_at desc);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (
    char_length(trim(body)) >= 1
    and char_length(body) <= 4000
  ),
  created_at timestamptz not null default now()
);

create index if not exists dm_messages_conversation_idx
  on public.dm_messages (conversation_id, created_at asc);

alter table public.dm_conversations enable row level security;
alter table public.dm_messages enable row level security;

create policy "Participants see conversations"
  on public.dm_conversations for select
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants create conversations"
  on public.dm_conversations for insert
  with check (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants update conversations"
  on public.dm_conversations for update
  using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants see messages"
  on public.dm_messages for select
  using (
    exists (
      select 1 from public.dm_conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
  );

create policy "Participants send messages"
  on public.dm_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.dm_conversations c
      where c.id = conversation_id
        and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
    )
    and not public.is_blocked(
      sender_id,
      case
        when (select participant_a from public.dm_conversations where id = conversation_id) = sender_id
        then (select participant_b from public.dm_conversations where id = conversation_id)
        else (select participant_a from public.dm_conversations where id = conversation_id)
      end
    )
  );

create or replace function public.touch_dm_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_dm_message_touch on public.dm_messages;
create trigger on_dm_message_touch
  after insert on public.dm_messages
  for each row
  execute function public.touch_dm_conversation();

create or replace function public.notify_dm_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  conv public.dm_conversations%rowtype;
  recipient uuid;
  sender_name text;
begin
  select * into conv from public.dm_conversations where id = new.conversation_id;
  if conv.participant_a = new.sender_id then
    recipient := conv.participant_b;
  else
    recipient := conv.participant_a;
  end if;

  if public.is_blocked(recipient, new.sender_id) then
    return new;
  end if;

  select coalesce(nullif(full_name, ''), username) into sender_name
  from public.profiles where id = new.sender_id;

  perform public.create_notification(
    recipient,
    'dm',
    'Nuovo messaggio',
    coalesce(sender_name, 'Un utente') || ' ti ha scritto',
    '/messaggi/' || new.conversation_id::text
  );
  return new;
end;
$$;

drop trigger if exists on_dm_message_notify on public.dm_messages;
create trigger on_dm_message_notify
  after insert on public.dm_messages
  for each row
  execute function public.notify_dm_message();

-- Realtime messaggi
alter table public.dm_messages replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dm_messages'
  ) then
    alter publication supabase_realtime add table public.dm_messages;
  end if;
end $$;

-- Blocca follow / commento se blocked
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

  if owner_id is null or owner_id = new.user_id then
    return new;
  end if;

  if public.is_blocked(owner_id, new.user_id) then
    return new;
  end if;

  perform public.create_notification(
    owner_id,
    'comment',
    'Nuovo commento',
    'Qualcuno ha commentato: ' || note_title,
    '/appunti/' || new.note_id::text
  );
  return new;
end;
$$;

create or replace function public.notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  follower_name text;
begin
  if public.is_blocked(new.following_id, new.follower_id) then
    return new;
  end if;

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
