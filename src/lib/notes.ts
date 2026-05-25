import type { SupabaseClient } from "@supabase/supabase-js";
import type { NoteComment, NoteStats, NoteWithAuthor } from "@/types/database";

export async function getNoteStats(
  supabase: SupabaseClient,
  noteId: string,
  userId?: string | null,
): Promise<NoteStats> {
  const { data: note } = await supabase
    .from("notes")
    .select("like_count")
    .eq("id", noteId)
    .single();

  const likeCount = note?.like_count ?? 0;

  if (!userId) {
    return { likeCount, userLiked: false };
  }

  const { data: liked } = await supabase
    .from("note_likes")
    .select("id")
    .eq("note_id", noteId)
    .eq("user_id", userId)
    .maybeSingle();

  return { likeCount, userLiked: !!liked };
}

/** Stats per liste: usa like_count denormalizzato + batch liked. */
export async function attachListStats(
  supabase: SupabaseClient,
  notes: NoteWithAuthor[],
  userId?: string | null,
): Promise<{ note: NoteWithAuthor; stats: NoteStats }[]> {
  if (notes.length === 0) return [];

  const noteIds = notes.map((n) => n.id);
  let likedSet = new Set<string>();

  if (userId) {
    const { data: likes } = await supabase
      .from("note_likes")
      .select("note_id")
      .eq("user_id", userId)
      .in("note_id", noteIds);
    likedSet = new Set((likes ?? []).map((l) => l.note_id));
  }

  return notes.map((note) => ({
    note,
    stats: {
      likeCount: note.like_count ?? 0,
      userLiked: likedSet.has(note.id),
    },
  }));
}

export async function getNoteComments(
  supabase: SupabaseClient,
  noteId: string,
): Promise<NoteComment[]> {
  const { data } = await supabase
    .from("note_comments")
    .select("*, profiles(username, full_name)")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });

  return (data ?? []) as NoteComment[];
}

export function getPublicFileUrl(
  supabase: SupabaseClient,
  filePath: string,
): string {
  const { data } = supabase.storage.from("notes").getPublicUrl(filePath);
  return data.publicUrl;
}

export function getPublicThumbnailUrl(
  supabase: SupabaseClient,
  thumbnailPath: string | null | undefined,
): string | null {
  if (!thumbnailPath?.trim()) return null;
  return getPublicFileUrl(supabase, thumbnailPath);
}

export function formatCommentDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "adesso";
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h fa`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} g fa`;

  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function applyNoteSort<T extends { order: (col: string, opts: { ascending: boolean }) => T }>(
  query: T,
  sort: "recent" | "downloads" | "likes",
): T {
  switch (sort) {
    case "downloads":
      return query.order("download_count", { ascending: false });
    case "likes":
      return query.order("like_count", { ascending: false });
    default:
      return query.order("created_at", { ascending: false });
  }
}
