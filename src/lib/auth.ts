import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AuthProfile = {
  username: string | null;
  is_admin: boolean;
};

export type AuthContext = {
  user: User | null;
  profile: AuthProfile | null;
  unreadNotifications: number;
};

/** Una sola round-trip auth + profilo + notifiche per richiesta (deduplicata con React.cache). */
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, unreadNotifications: 0 };
  }

  const [{ data: profile }, { count }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
  ]);

  return {
    user,
    profile: profile
      ? { username: profile.username ?? null, is_admin: !!profile.is_admin }
      : null,
    unreadNotifications: count ?? 0,
  };
});

/** Utente autenticato dalla cache di layout/header. */
export const getCachedUser = cache(async () => {
  const { user } = await getAuthContext();
  return user;
});

/** Utente obbligatorio (redirect login). */
export async function requireCachedUser(nextPath?: string): Promise<User> {
  const user = await getCachedUser();
  if (!user) {
    redirect(
      nextPath
        ? `/auth/login?next=${encodeURIComponent(nextPath)}`
        : "/auth/login",
    );
  }
  return user;
}
