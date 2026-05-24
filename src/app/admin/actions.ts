"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { reindexNotesPdfText, type ReindexResult } from "@/lib/reindex-notes";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin");
  const admin = await isAdmin(supabase, user.id);
  if (!admin) redirect("/");
  return { supabase, user };
}

export async function updateReportStatus(formData: FormData) {
  const { supabase } = await requireAdmin();

  const reportId = String(formData.get("report_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!["reviewed", "dismissed"].includes(status)) return;

  await supabase.from("content_reports").update({ status }).eq("id", reportId);

  revalidatePath("/admin");
}

export async function deleteReportedNoteForm(formData: FormData) {
  const noteId = String(formData.get("note_id") ?? "");
  if (!noteId) return;
  await deleteReportedNote(noteId);
}

export async function deleteReportedNote(noteId: string) {
  const { supabase } = await requireAdmin();

  const { data: note } = await supabase
    .from("notes")
    .select("file_path")
    .eq("id", noteId)
    .maybeSingle();

  if (note) {
    await supabase.storage.from("notes").remove([note.file_path]);
    await supabase.from("notes").delete().eq("id", noteId);
  }

  revalidatePath("/admin");
  revalidatePath("/cerca");
}

export async function bulkReindexPdfText(all: boolean): Promise<ReindexResult> {
  await requireAdmin();

  if (!hasServiceRole()) {
    return {
      processed: 0,
      updated: 0,
      failed: 0,
      errors: ["SUPABASE_SERVICE_ROLE_KEY non configurata."],
    };
  }

  const service = createServiceClient();
  const aggregate: ReindexResult = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  let offset = 0;
  const batchSize = 25;

  do {
    const batch = await reindexNotesPdfText(service, {
      limit: batchSize,
      offset,
    });
    aggregate.processed += batch.processed;
    aggregate.updated += batch.updated;
    aggregate.failed += batch.failed;
    aggregate.errors.push(...batch.errors);

    if (!all || batch.processed < batchSize) break;
    offset += batchSize;
  } while (all);

  revalidatePath("/cerca");
  revalidatePath("/admin");

  return aggregate;
}

export async function hideCommentForm(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const commentId = String(formData.get("comment_id") ?? "");
  if (!commentId) return;

  await supabase
    .from("note_comments")
    .update({
      hidden_at: new Date().toISOString(),
      hidden_by: user.id,
    })
    .eq("id", commentId);

  revalidatePath("/admin");
}

export async function restoreCommentForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const commentId = String(formData.get("comment_id") ?? "");
  if (!commentId) return;

  await supabase
    .from("note_comments")
    .update({ hidden_at: null, hidden_by: null })
    .eq("id", commentId);

  revalidatePath("/admin");
}

export async function deleteCommentAdminForm(formData: FormData) {
  const { supabase } = await requireAdmin();

  const commentId = String(formData.get("comment_id") ?? "");
  const noteId = String(formData.get("note_id") ?? "");
  if (!commentId) return;

  await supabase.from("note_comments").delete().eq("id", commentId);

  revalidatePath("/admin");
  if (noteId) revalidatePath(`/appunti/${noteId}`);
}
