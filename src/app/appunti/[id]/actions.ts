"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth";
import { isBlockedBetween } from "@/lib/blocks";
import { checkRateLimit } from "@/lib/rate-limit";

async function requireUser() {
  const supabase = await createClient();
  const user = await getCachedUser();
  if (!user) redirect("/auth/login");
  return { supabase, user };
}

export async function toggleLike(noteId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("note_likes")
    .select("id")
    .eq("note_id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("note_likes").delete().eq("id", existing.id);
  } else {
    const { data: note } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", noteId)
      .single();

    if (note && (await isBlockedBetween(supabase, user.id, note.user_id))) {
      return;
    }

    const limit = await checkRateLimit(supabase, user.id, "like");
    if (!limit.allowed) return;

    await supabase.from("note_likes").insert({ note_id: noteId, user_id: user.id });
  }

  revalidatePath(`/appunti/${noteId}`);
  revalidatePath("/");
  revalidatePath("/cerca");
  revalidatePath("/profilo");
}

export async function addComment(noteId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const limit = await checkRateLimit(supabase, user.id, "comment");
  if (!limit.allowed) {
    throw new Error(limit.message);
  }

  const { data: note } = await supabase
    .from("notes")
    .select("user_id")
    .eq("id", noteId)
    .single();

  if (note && (await isBlockedBetween(supabase, user.id, note.user_id))) {
    throw new Error("Non puoi commentare questo appunto.");
  }

  const { error } = await supabase.from("note_comments").insert({
    note_id: noteId,
    user_id: user.id,
    body,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/appunti/${noteId}`);
}

export async function deleteComment(commentId: string, noteId: string) {
  const { supabase, user } = await requireUser();

  await supabase
    .from("note_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/appunti/${noteId}`);
}

/** Incrementa download solo per utenti loggati (dedupe 24h lato DB). */
export async function recordDownload(
  noteId: string,
): Promise<{ ok: true; counted: boolean } | { ok: false; rateLimited: true }> {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) return { ok: true, counted: false };

  const limit = await checkRateLimit(supabase, user.id, "download");
  if (!limit.allowed) return { ok: false, rateLimited: true };

  const { data: counted } = await supabase.rpc("increment_note_download", {
    p_note_id: noteId,
  });

  if (counted) {
    revalidatePath(`/appunti/${noteId}`);
    revalidatePath("/profilo");
    revalidatePath("/cerca");
    revalidatePath("/");
  }

  return { ok: true, counted: !!counted };
}
