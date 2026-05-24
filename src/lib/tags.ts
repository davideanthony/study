import type { SupabaseClient } from "@supabase/supabase-js";
import { SUGGESTED_TAGS } from "@/lib/constants";

export const MIN_TAGS = 1;
export const MAX_TAGS = 8;

export function parseTagInput(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(/[,#]/)) {
    const name = part.trim().toLowerCase().replace(/\s+/g, "-");
    if (name.length < 2 || name.length > 40) continue;
    if (!/^[a-z0-9_-]+$/.test(name)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    tags.push(name);
    if (tags.length >= MAX_TAGS) break;
  }
  return tags;
}

export function validateTagsInput(
  raw: string,
): { ok: true; tags: string[] } | { ok: false; error: string } {
  const tags = parseTagInput(raw);
  if (tags.length < MIN_TAGS) {
    return {
      ok: false,
      error: `Inserisci almeno ${MIN_TAGS} tag (es. esame, analisi-1). Clicca un suggerimento o scrivili separati da virgola.`,
    };
  }
  return { ok: true, tags };
}

export async function getPopularTags(
  supabase: SupabaseClient,
  limit = 12,
): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_popular_tags", {
    p_limit: limit,
  });

  if (error || !data?.length) {
    return [...SUGGESTED_TAGS].slice(0, limit);
  }

  const fromDb = (data as { name: string; usage_count: number }[]).map((r) => r.name);
  const merged = [...fromDb];
  for (const fallback of SUGGESTED_TAGS) {
    if (merged.length >= limit) break;
    if (!merged.includes(fallback)) merged.push(fallback);
  }
  return merged.slice(0, limit);
}

export async function syncNoteTags(
  supabase: SupabaseClient,
  noteId: string,
  tagNames: string[],
): Promise<void> {
  await supabase.from("note_tags").delete().eq("note_id", noteId);

  if (tagNames.length === 0) return;

  for (const name of tagNames) {
    const { data: existing } = await supabase
      .from("tags")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    let tagId = existing?.id;
    if (!tagId) {
      const { data: created } = await supabase
        .from("tags")
        .insert({ name })
        .select("id")
        .single();
      tagId = created?.id;
    }
    if (tagId) {
      await supabase.from("note_tags").insert({ note_id: noteId, tag_id: tagId });
    }
  }
}

export async function getNoteTags(
  supabase: SupabaseClient,
  noteId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("note_tags")
    .select("tags(name)")
    .eq("note_id", noteId);

  return (data ?? [])
    .map((row) => {
      const t = row.tags as { name: string } | { name: string }[] | null;
      if (!t) return null;
      if (Array.isArray(t)) return t[0]?.name ?? null;
      return t.name;
    })
    .filter((n): n is string => !!n);
}

export async function getNoteIdsByTag(
  supabase: SupabaseClient,
  tagName: string,
): Promise<string[] | null> {
  const normalized = tagName.trim().toLowerCase();
  if (!normalized) return null;

  const { data: tag } = await supabase
    .from("tags")
    .select("id")
    .ilike("name", normalized)
    .maybeSingle();

  if (!tag) return [];

  const { data: links } = await supabase
    .from("note_tags")
    .select("note_id")
    .eq("tag_id", tag.id);

  return (links ?? []).map((l) => l.note_id);
}
