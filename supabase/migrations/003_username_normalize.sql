-- Username sempre minuscolo in creazione profilo (unicità su profiles.username)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  final_username text;
begin
  raw_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );
  final_username := lower(trim(raw_username));

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
exception
  when unique_violation then
    raise exception 'username_already_taken'
      using hint = 'Questo username è già in uso.';
end;
$$;
