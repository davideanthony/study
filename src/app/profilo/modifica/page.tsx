import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = { title: "Modifica profilo" };

export default async function ModificaProfiloPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/profilo/modifica");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/profilo");

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/profilo" className="text-sm font-medium text-sage hover:underline">
        ← Torna al profilo
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Modifica profilo</h1>
      <p className="mt-1 text-sm text-muted">Aggiorna username e nome visualizzato.</p>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {error}
        </p>
      )}

      <form action={updateProfile} className="card mt-8 space-y-4 rounded-2xl p-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-muted">
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            defaultValue={profile.username}
            className="input-field mt-1 w-full px-4 py-3"
          />
          <p className="mt-1 text-xs text-muted">Lettere, numeri e underscore.</p>
        </div>
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-muted">
            Nome visualizzato
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name}
            className="input-field mt-1 w-full px-4 py-3"
            placeholder="Come ti vedono gli altri"
          />
        </div>
        <p className="text-xs text-muted">Email: {user.email}</p>
        <button type="submit" className="btn-primary w-full py-3">
          Salva modifiche
        </button>
      </form>
    </div>
  );
}
