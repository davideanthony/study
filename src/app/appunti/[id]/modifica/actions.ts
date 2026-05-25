"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCachedUser } from "@/lib/auth";
import { findDuplicateNotes } from "@/lib/duplicates";
import { validatePdfFileContent } from "@/lib/pdf-validation";
import { schedulePdfPostUpload } from "@/lib/pdf-text-job";
import { PDF_STORAGE_CACHE_CONTROL } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { syncNoteTags, validateTagsInput } from "@/lib/tags";

export async function updateNote(noteId: string, formData: FormData) {
  const supabase = await createClient();
  const user = await getCachedUser();

  if (!user) redirect(`/auth/login?next=/appunti/${noteId}/modifica`);

  const { data: existing } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .single();

  if (!existing) redirect("/profilo");

  const title = String(formData.get("title") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const university = String(formData.get("university") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const academicYear = String(formData.get("academic_year") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const faculty = String(formData.get("faculty") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const tagCheck = validateTagsInput(tagsRaw);
  if (!tagCheck.ok) {
    redirect(`/appunti/${noteId}/modifica?error=${encodeURIComponent(tagCheck.error)}`);
  }
  const tagNames = tagCheck.tags;
  const file = formData.get("file") as File | null;
  const force = formData.get("force") === "1";

  if (!title || !course || !university) {
    redirect(`/appunti/${noteId}/modifica?error=Compila tutti i campi obbligatori.`);
  }

  if (!force) {
    const duplicates = await findDuplicateNotes(supabase, {
      title,
      course,
      university,
      excludeId: noteId,
    });
    if (duplicates.length > 0) {
      redirect(`/appunti/${noteId}/modifica?duplicate=1`);
    }
  }

  let filePath = existing.file_path;
  let fileName = existing.file_name;
  let pdfText = existing.pdf_text ?? "";

  if (file && file.size > 0) {
    const uploadLimit = await checkRateLimit(supabase, user.id, "upload");
    if (!uploadLimit.allowed) {
      redirect(`/appunti/${noteId}/modifica?error=${encodeURIComponent(uploadLimit.message)}`);
    }

    const pdfCheck = await validatePdfFileContent(file);
    if (!pdfCheck.ok) {
      redirect(`/appunti/${noteId}/modifica?error=${encodeURIComponent(pdfCheck.error)}`);
    }

    pdfText = "";

    const currentVersion = existing.version_number ?? 1;

    await supabase.from("note_versions").upsert(
      {
        note_id: noteId,
        version_number: currentVersion,
        file_path: existing.file_path,
        file_name: existing.file_name,
        pdf_text: existing.pdf_text ?? "",
        created_by: user.id,
      },
      { onConflict: "note_id,version_number" },
    );

    const nextVersion = currentVersion + 1;
    const newPath = `${user.id}/${noteId}-v${nextVersion}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("notes")
      .upload(newPath, pdfCheck.buffer, {
        contentType: "application/pdf",
        upsert: false,
        cacheControl: PDF_STORAGE_CACHE_CONTROL,
      });

    if (uploadError) {
      redirect(`/appunti/${noteId}/modifica?error=${encodeURIComponent(uploadError.message)}`);
    }

    await supabase.from("note_versions").insert({
      note_id: noteId,
      version_number: nextVersion,
      file_path: newPath,
      file_name: file.name,
      pdf_text: "",
      created_by: user.id,
    });

    filePath = newPath;
    fileName = file.name;

    await supabase
      .from("notes")
      .update({ version_number: nextVersion })
      .eq("id", noteId);

    schedulePdfPostUpload({
      noteId,
      userId: user.id,
      filePath: newPath,
      versionNumber: nextVersion,
    });
  }

  const { error } = await supabase
    .from("notes")
    .update({
      title,
      course,
      university,
      description,
      academic_year: academicYear,
      semester,
      faculty,
      file_path: filePath,
      file_name: fileName,
      pdf_text: pdfText,
      ...(file && file.size > 0 ? { thumbnail_path: null } : {}),
    })
    .eq("id", noteId);

  if (error) {
    redirect(`/appunti/${noteId}/modifica?error=${encodeURIComponent(error.message)}`);
  }

  await syncNoteTags(supabase, noteId, tagNames);

  revalidatePath(`/appunti/${noteId}`);
  revalidatePath("/cerca");
  revalidatePath("/profilo");
  redirect(`/appunti/${noteId}`);
}

export async function updateNoteForm(formData: FormData) {
  const noteId = String(formData.get("note_id") ?? "");
  if (!noteId) redirect("/profilo");
  await updateNote(noteId, formData);
}
