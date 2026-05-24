import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { NotificationsBell } from "@/components/NotificationsBell";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    isAdmin = !!profile?.is_admin;
  }

  return (
    <header className="border-b border-gray-light bg-surface/85 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
        <Logo />
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-2 text-sm font-medium sm:gap-4">
          <Link href="/cerca" className="text-muted transition hover:text-sage">
            Cerca
          </Link>
          {user ? (
            <>
              <Link href="/salvati" className="hidden text-muted transition hover:text-sage sm:inline">
                Salvati
              </Link>
              <Link href="/carica" className="text-muted transition hover:text-sage">
                Carica
              </Link>
              <Link href="/messaggi" className="hidden text-muted transition hover:text-sage sm:inline">
                Messaggi
              </Link>
              <NotificationsBell />
              <Link
                href="/profilo"
                title={username ?? "Profilo"}
                className="max-w-[6.5rem] shrink truncate rounded-full bg-mint-light px-2.5 py-1.5 text-sage-dark shadow-[var(--shadow-soft)] sm:max-w-[10rem] sm:px-3"
              >
                {username ?? "Profilo"}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-xs text-muted hover:text-sage">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-muted transition hover:text-sage">
                Accedi
              </Link>
              <Link href="/auth/signup" className="btn-primary px-4 py-2 text-sm">
                Registrati
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
