import type { SupabaseClient } from "@supabase/supabase-js";
import type { NoteSort } from "@/lib/search-params";
import type { NoteWithAuthor } from "@/types/database";

export type NoteSearchParams = {
  q?: string;
  universita?: string;
  corso?: string;
  anno?: string;
  semestre?: string;
  facolta?: string;
  tag?: string;
  sort: NoteSort;
  from: number;
  to: number;
  excludeUserIds?: string[];
  noteIdsFilter?: string[];
};

export type NoteSearchResult = {
  notes: NoteWithAuthor[];
  total: number;
};

/** Ricerca con full-text PostgreSQL (colonna fts) + filtri. */
export async function searchNotes(
  supabase: SupabaseClient,
  params: NoteSearchParams,
): Promise<NoteSearchResult> {
  let query = supabase
    .from("notes")
    .select("*, profiles(username, full_name, avatar_url)", { count: "exact" });

  if (params.universita?.trim()) {
    query = query.ilike("university", `%${params.universita.trim()}%`);
  }
  if (params.corso?.trim()) {
    query = query.ilike("course", `%${params.corso.trim()}%`);
  }
  if (params.anno?.trim()) {
    query = query.eq("academic_year", params.anno.trim());
  }
  if (params.semestre?.trim()) {
    query = query.eq("semester", params.semestre.trim());
  }
  if (params.facolta?.trim()) {
    query = query.ilike("faculty", `%${params.facolta.trim()}%`);
  }

  if (params.noteIdsFilter) {
    if (params.noteIdsFilter.length === 0) {
      return { notes: [], total: 0 };
    }
    query = query.in("id", params.noteIdsFilter);
  }

  if (params.excludeUserIds && params.excludeUserIds.length > 0) {
    query = query.not("user_id", "in", `(${params.excludeUserIds.join(",")})`);
  }

  if (params.q?.trim()) {
    query = query.textSearch("fts", params.q.trim(), {
      type: "websearch",
      config: "italian",
    });
  }

  switch (params.sort) {
    case "downloads":
      query = query.order("download_count", { ascending: false });
      break;
    case "likes":
      query = query.order("like_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, count, error } = await query.range(params.from, params.to);

  if (error) {
    console.error("[searchNotes]", error.message);
    return { notes: [], total: 0 };
  }

  return {
    notes: (data ?? []) as NoteWithAuthor[],
    total: count ?? 0,
  };
}
