"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";

type OAuthButtonsProps = {
  next?: string;
};

export function OAuthButtons({ next }: OAuthButtonsProps) {
  const supabase = createClient();

  async function signIn(provider: "google" | "apple") {
    const origin = typeof window !== "undefined" ? window.location.origin : getSiteUrl().origin;
    const redirectTo = new URL("/auth/callback", origin);
    if (next) redirectTo.searchParams.set("next", next);

    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo.toString() },
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted">oppure</p>
      <button
        type="button"
        onClick={() => signIn("google")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-light bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
      >
        Continua con Google
      </button>
      <button
        type="button"
        onClick={() => signIn("apple")}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-light bg-foreground px-4 py-2.5 text-sm font-medium text-surface shadow-[var(--shadow-soft)] transition hover:opacity-90"
      >
        Continua con Apple
      </button>
      <p className="text-center text-[11px] leading-snug text-muted">
        Abilita Google e Apple in Supabase → Authentication → Providers.
      </p>
    </div>
  );
}
