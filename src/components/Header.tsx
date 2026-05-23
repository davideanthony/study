import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <header className="border-b border-gray-light bg-surface/85 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/cerca" className="text-muted transition hover:text-sage">
            Cerca
          </Link>
          {user ? (
            <>
              <Link href="/carica" className="text-muted transition hover:text-sage">
                Carica
              </Link>
              <Link
                href="/profilo"
                className="rounded-full bg-mint-light px-3 py-1.5 text-sage-dark shadow-[var(--shadow-soft)]"
              >
                {username ?? "Profilo"}
              </Link>
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
