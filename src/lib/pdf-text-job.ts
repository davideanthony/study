import { after } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractPdfText } from "@/lib/pdf-extract";
import {
  noteThumbnailStoragePath,
  renderPdfFirstPageThumbnail,
} from "@/lib/pdf-thumbnail";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import { PDF_STORAGE_CACHE_CONTROL } from "@/lib/storage";

type PdfPostUploadJobOptions = {
  noteId: string;
  userId: string;
  filePath: string;
  versionNumber?: number;
};

async function runPdfPostUploadJob({
  noteId,
  userId,
  filePath,
  versionNumber,
}: PdfPostUploadJobOptions): Promise<void> {
  const supabase = hasServiceRole()
    ? createServiceClient()
    : await createClient();

  const { data: file, error: dlError } = await supabase.storage
    .from("notes")
    .download(filePath);

  if (dlError || !file) {
    console.error("[pdf-post-upload] download", noteId, dlError?.message);
    return;
  }

  const buffer = await file.arrayBuffer();
  const [pdfText, thumbBuffer] = await Promise.all([
    extractPdfText(buffer),
    renderPdfFirstPageThumbnail(buffer),
  ]);

  const updates: { pdf_text: string; thumbnail_path?: string } = {
    pdf_text: pdfText,
  };

  if (thumbBuffer) {
    const thumbPath = noteThumbnailStoragePath(userId, noteId);
    const { error: thumbUpError } = await supabase.storage
      .from("notes")
      .upload(thumbPath, thumbBuffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: PDF_STORAGE_CACHE_CONTROL,
      });

    if (!thumbUpError) {
      updates.thumbnail_path = thumbPath;
    } else {
      console.error("[pdf-post-upload] thumb upload", noteId, thumbUpError.message);
    }
  }

  const { error: upError } = await supabase
    .from("notes")
    .update(updates)
    .eq("id", noteId);

  if (upError) {
    console.error("[pdf-post-upload] update note", noteId, upError.message);
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
  revalidateTag("sitemap-notes", "max");
}

/** Testo full-text + thumbnail dopo la risposta HTTP. */
export function schedulePdfPostUpload(options: PdfPostUploadJobOptions): void {
  after(() => runPdfPostUploadJob(options));
}

/** @deprecated Usa schedulePdfPostUpload */
export function schedulePdfTextExtraction(
  options: Omit<PdfPostUploadJobOptions, "userId"> & { userId?: string },
): void {
  if (!options.userId) {
    console.error("[schedulePdfTextExtraction] userId richiesto");
    return;
  }
  schedulePdfPostUpload({
    noteId: options.noteId,
    userId: options.userId,
    filePath: options.filePath,
    versionNumber: options.versionNumber,
  });
}
