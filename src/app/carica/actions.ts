"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findDuplicateNotes } from "@/lib/duplicates";
import { extractPdfText } from "@/lib/pdf-extract";
import { validatePdfFileContent } from "@/lib/pdf-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseTagInput, syncNoteTags, validateTagsInput } from "@/lib/tags";

export async function uploadNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/carica");
  }

  const title = String(formData.get("title") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const academicYear = String(formData.get("academic_year") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
  const file = formData.get("file") as File | null;
  const force = formData.get("force") === "1";

  if (!title || !course || !university || !file || file.size === 0) {
    redirect("/carica?error=Compila tutti i campi obbligatori e allega un PDF.");
  }

  const limit = await checkRateLimit(supabase, user.id, "upload");
  if (!limit.allowed) {
    redirect(`/carica?error=${encodeURIComponent(limit.message)}`);
  }

  const tagsRaw = String(formData.get("tags") ?? "");
  const tagCheck = validateTagsInput(tagsRaw);
  if (!tagCheck.ok) {
    redirect(`/carica?error=${encodeURIComponent(tagCheck.error)}`);
  }
  const tagNames = tagCheck.tags;

  const pdfCheck = await validatePdfFileContent(file);
  if (!pdfCheck.ok) {
    redirect(`/carica?error=${encodeURIComponent(pdfCheck.error)}`);
  }

  if (!force) {
    const duplicates = await findDuplicateNotes(supabase, {
      title,
      course,
      university,
    });
    if (duplicates.length > 0) {
      const ids = duplicates.map((d) => d.id).join(",");
      redirect(
        `/carica?duplicate=1&dup_ids=${encodeURIComponent(ids)}&title=${encodeURIComponent(title)}&course=${encodeURIComponent(course)}&university=${encodeURIComponent(university)}`,
      );
    }
  }

  const noteId = crypto.randomUUID();
  const filePath = `${user.id}/${noteId}.pdf`;
  const pdfText = await extractPdfText(pdfCheck.buffer);

  const { error: uploadError } = await supabase.storage
    .from("notes")
    .upload(filePath, pdfCheck.buffer, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    redirect(`/carica?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: note, error: insertError } = await supabase
    .from("notes")
    .insert({
      id: noteId,
      user_id: user.id,
      title,
      course,
      university,
      description,
      academic_year: academicYear,
      semester,
      faculty,
      file_path: filePath,
      file_name: file.name,
      pdf_text: pdfText,
    })
    .select("id")
    .single();

  if (insertError || !note) {
    await supabase.storage.from("notes").remove([filePath]);
    redirect(`/carica?error=${encodeURIComponent(insertError?.message ?? "Errore")}`);
  }

  await supabase.from("note_versions").insert({
    note_id: noteId,
    version_number: 1,
    file_path: filePath,
    file_name: file.name,
    pdf_text: pdfText,
    created_by: user.id,
  });

  await syncNoteTags(supabase, noteId, tagNames);

  revalidatePath("/");
  revalidatePath("/cerca");
  revalidatePath("/profilo");
  redirect(`/appunti/${note.id}?uploaded=1`);
}
