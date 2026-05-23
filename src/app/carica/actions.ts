"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  const file = formData.get("file") as File | null;

  if (!title || !course || !university || !file || file.size === 0) {
    redirect("/carica?error=Compila tutti i campi obbligatori e allega un PDF.");
  }

  if (file.type !== "application/pdf") {
    redirect("/carica?error=Solo file PDF sono ammessi.");
  }

  const noteId = crypto.randomUUID();
  const filePath = `${user.id}/${noteId}.pdf`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("notes")
    .upload(filePath, arrayBuffer, {
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
      file_path: filePath,
      file_name: file.name,
    })
    .select("id")
    .single();

  if (insertError || !note) {
    await supabase.storage.from("notes").remove([filePath]);
    redirect(`/carica?error=${encodeURIComponent(insertError?.message ?? "Errore")}`);
  }

  revalidatePath("/");
  revalidatePath("/profilo");
  redirect(`/appunti/${note.id}`);
}
