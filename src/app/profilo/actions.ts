"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service";

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
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim().slice(0, 500);
  const defaultUniversity = String(formData.get("default_university") ?? "").trim();

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
    .update({
      username,
      full_name: fullName,
      bio,
      avatar_url: avatarUrl,
      default_university: defaultUniversity,
    })
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

export async function deleteAccount(formData: FormData) {
  const { supabase, user } = await requireUser();

  const phrase = String(formData.get("confirm_phrase") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (phrase !== "ELIMINA") {
    redirect(
      `/profilo/modifica?error=${encodeURIComponent('Digita "ELIMINA" per confermare.')}`,
    );
  }

  const hasEmailProvider =
    user.identities?.some((i) => i.provider === "email") ?? Boolean(user.email);

  if (hasEmailProvider) {
    if (!password) {
      redirect(
        `/profilo/modifica?error=${encodeURIComponent("Inserisci la password per confermare.")}`,
      );
    }
    if (!user.email) {
      redirect(
        `/profilo/modifica?error=${encodeURIComponent("Account senza email collegata.")}`,
      );
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (authError) {
      redirect(
        `/profilo/modifica?error=${encodeURIComponent("Password non corretta.")}`,
      );
    }
  }

  if (!hasServiceRole()) {
    redirect(
      `/profilo/modifica?error=${encodeURIComponent("Eliminazione account non configurata sul server (manca SUPABASE_SERVICE_ROLE_KEY).")}`,
    );
  }

  const service = createServiceClient();

  const { data: notes } = await service
    .from("notes")
    .select("file_path")
    .eq("user_id", user.id);

  const paths = (notes ?? []).map((n) => n.file_path).filter(Boolean);
  if (paths.length > 0) {
    await service.storage.from("notes").remove(paths);
  }

  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    redirect(
      `/profilo/modifica?error=${encodeURIComponent(deleteError.message)}`,
    );
  }

  await supabase.auth.signOut();
  redirect("/?account_deleted=1");
}
