import type { SupabaseClient } from "@supabase/supabase-js";
import type { NoteComment, NoteStats } from "@/types/database";

export async function getNoteStats(
  supabase: SupabaseClient,
  noteId: string,
  userId?: string | null,
): Promise<NoteStats> {
  const [{ count: likeCount }, liked] = await Promise.all([
    supabase
      .from("note_likes")
      .select("*", { count: "exact", head: true })
      .eq("note_id", noteId),
    userId
      ? supabase
          .from("note_likes")
          .select("id")
          .eq("note_id", noteId)
          .eq("user_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    likeCount: likeCount ?? 0,
    userLiked: !!liked.data,
  };
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
