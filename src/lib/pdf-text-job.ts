import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractPdfText } from "@/lib/pdf-extract";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

type PdfTextJobOptions = {
  noteId: string;
  filePath: string;
  versionNumber?: number;
};

async function runPdfTextExtraction({
  noteId,
  filePath,
  versionNumber,
}: PdfTextJobOptions): Promise<void> {
  const supabase = hasServiceRole()
    ? createServiceClient()
    : await createClient();

  const { data: file, error: dlError } = await supabase.storage
    .from("notes")
    .download(filePath);

  if (dlError || !file) {
    console.error("[pdf-text-job] download", noteId, dlError?.message);
    return;
  }

  const pdfText = await extractPdfText(await file.arrayBuffer());

  const { error: upError } = await supabase
    .from("notes")
    .update({ pdf_text: pdfText })
    .eq("id", noteId);

  if (upError) {
    console.error("[pdf-text-job] update note", noteId, upError.message);
    return;
  }

  if (versionNumber != null) {
    await supabase
      .from("note_versions")
      .update({ pdf_text: pdfText })
      .eq("note_id", noteId)
      .eq("version_number", versionNumber);
  }

  revalidatePath(`/appunti/${noteId}`);
  revalidatePath("/cerca");
  revalidatePath("/");
  revalidateTag("recent-notes", "max");
}

/** Estrazione full-text PDF dopo la risposta HTTP (non blocca l'upload). */
export function schedulePdfTextExtraction(options: PdfTextJobOptions): void {
  after(() => runPdfTextExtraction(options));
}
