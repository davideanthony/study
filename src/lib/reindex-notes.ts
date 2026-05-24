import type { SupabaseClient } from "@supabase/supabase-js";
import { extractPdfText } from "@/lib/pdf-extract";

export type ReindexResult = {
  processed: number;
  updated: number;
  failed: number;
  errors: string[];
};

const BATCH = 25;

/** Scarica PDF da storage e aggiorna pdf_text (usa client con permessi adeguati). */
export async function reindexNotesPdfText(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number },
): Promise<ReindexResult> {
  const limit = options?.limit ?? BATCH;
  const offset = options?.offset ?? 0;
  const result: ReindexResult = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, file_path, title")
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    result.errors.push(error.message);
    return result;
  }

  if (!notes?.length) return result;

  for (const note of notes) {
    result.processed += 1;
    try {
      const { data: file, error: dlError } = await supabase.storage
        .from("notes")
        .download(note.file_path);

      if (dlError || !file) {
        result.failed += 1;
        result.errors.push(`${note.id}: ${dlError?.message ?? "download fallito"}`);
        continue;
      }

      const buffer = await file.arrayBuffer();
      const pdfText = await extractPdfText(buffer);

      const { error: upError } = await supabase
        .from("notes")
        .update({ pdf_text: pdfText })
        .eq("id", note.id);

      if (upError) {
        result.failed += 1;
        result.errors.push(`${note.id}: ${upError.message}`);
      } else {
        result.updated += 1;
      }
    } catch (e) {
      result.failed += 1;
      result.errors.push(
        `${note.id}: ${e instanceof Error ? e.message : "errore sconosciuto"}`,
      );
    }
  }

  return result;
}
