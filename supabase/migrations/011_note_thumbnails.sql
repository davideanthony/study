-- Anteprima immagine (prima pagina PDF) per liste e lazy preview

alter table public.notes
  add column if not exists thumbnail_path text;
