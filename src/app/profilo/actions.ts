"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/profilo");
  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const usernameInput = String(formData.get("username") ?? "");

  const usernameCheck = validateUsername(usernameInput);
  if (!usernameCheck.ok) {
    redirect(`/profilo/modifica?error=${encodeURIComponent(usernameCheck.error)}`);
  }
  const username = usernameCheck.username;

  const { data: current } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (current?.username !== username) {
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (taken) {
      redirect(
        `/profilo/modifica?error=${encodeURIComponent("Questo username è già in uso.")}`,
      );
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, full_name: fullName })
    .eq("id", user.id);

  if (error) {
    redirect(`/profilo/modifica?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profilo");
  revalidatePath(`/profilo/${user.id}`);
  redirect("/profilo");
}

export async function deleteNote(noteId: string, redirectTo = "/profilo") {
  const { supabase, user } = await requireUser();

  const { data: note } = await supabase
    .from("notes")
    .select("id, file_path, user_id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!note) {
    redirect(redirectTo);
  }

  await supabase.storage.from("notes").remove([note.file_path]);
  await supabase.from("notes").delete().eq("id", noteId);

  revalidatePath("/");
  revalidatePath("/cerca");
  revalidatePath("/profilo");
  revalidatePath(`/profilo/${user.id}`);
  redirect(redirectTo);
}
