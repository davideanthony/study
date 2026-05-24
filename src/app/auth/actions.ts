"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { validateUsername } from "@/lib/username";
import { getSiteUrl } from "@/lib/site-url";

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

  redirect("/profilo?registered=1");
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

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect("/auth/forgot-password?error=Inserisci la tua email.");
  }

  const siteUrl = getSiteUrl().origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`,
  });

  if (error) {
    redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    redirect(
      `/auth/reset-password?error=${encodeURIComponent("La password deve avere almeno 8 caratteri.")}`,
    );
  }

  if (password !== confirm) {
    redirect(
      `/auth/reset-password?error=${encodeURIComponent("Le password non coincidono.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profilo?password_updated=1");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profilo/modifica");

  const password = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) {
    redirect(
      `/profilo/modifica?error=${encodeURIComponent("La nuova password deve avere almeno 8 caratteri.")}`,
    );
  }

  if (password !== confirm) {
    redirect(
      `/profilo/modifica?error=${encodeURIComponent("Le password non coincidono.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/profilo/modifica?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profilo/modifica?password_ok=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
