"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

export async function recordDownload(noteId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_note_download", {
    p_note_id: noteId,
  });

  if (error) return;

  revalidatePath(`/appunti/${noteId}`);
  revalidatePath("/profilo");
  revalidatePath("/cerca");
  revalidatePath("/");
}
