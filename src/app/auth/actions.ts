"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { validateUsername } from "@/lib/username";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const usernameInput = String(formData.get("username") ?? "");

  const usernameCheck = validateUsername(usernameInput);
  if (!usernameCheck.ok) {
    redirect(`/auth/signup?error=${encodeURIComponent(usernameCheck.error)}`);
  }
  const username = usernameCheck.username;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("Questo username è già in uso. Scegline un altro.")}`,
    );
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, full_name: fullName },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase().includes("already registered")
      ? "Questa email è già registrata."
      : error.message;
    redirect(`/auth/signup?error=${encodeURIComponent(msg)}`);
  }

  if (signUpData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", signUpData.user.id)
      .maybeSingle();

    if (profile && profile.username !== username) {
      redirect(
        `/auth/signup?error=${encodeURIComponent("Questo username è già in uso. Scegline un altro.")}`,
      );
    }
  }

  if (!signUpData.session) {
    redirect("/auth/signup?check_email=1");
  }

  redirect("/profilo");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  const next = safeRedirectPath(String(formData.get("next") ?? ""));
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
