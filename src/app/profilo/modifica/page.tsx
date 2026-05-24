import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { changePassword } from "@/app/auth/actions";
import { updateProfile } from "../actions";
import { ALL_UNIVERSITIES } from "@/lib/constants";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";

type PageProps = {
  searchParams: Promise<{ error?: string; password_ok?: string }>;
};

export const metadata = { title: "Modifica profilo" };

export default async function ModificaProfiloPage({ searchParams }: PageProps) {
  const { error, password_ok } = await searchParams;
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

  const hasEmailProvider =
    user.identities?.some((i) => i.provider === "email") ?? Boolean(user.email);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/profilo" className="text-sm font-medium text-sage hover:underline">
        ← Torna al profilo
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-foreground">Modifica profilo</h1>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}
      {password_ok && (
        <p className="mt-4 rounded-xl border border-sage/30 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          Password aggiornata.
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
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-muted">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={500}
            defaultValue={profile.bio}
            className="input-field mt-1 w-full px-4 py-3"
            placeholder="Corso di laurea, interessi…"
          />
        </div>
        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-muted">
            URL avatar (opzionale)
          </label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="url"
            defaultValue={profile.avatar_url}
            className="input-field mt-1 w-full px-4 py-3"
            placeholder="https://…"
          />
        </div>
        <div>
          <label htmlFor="default_university" className="block text-sm font-medium text-muted">
            Università predefinita (per upload)
          </label>
          <select
            id="default_university"
            name="default_university"
            defaultValue={profile.default_university}
            className="input-field mt-1 w-full px-4 py-3"
          >
            <option value="">—</option>
            {ALL_UNIVERSITIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted">Email: {user.email}</p>
        <button type="submit" className="btn-primary w-full py-3">
          Salva profilo
        </button>
      </form>

      <form action={changePassword} className="card mt-8 space-y-4 rounded-2xl p-6">
        <h2 className="font-semibold text-foreground">Cambia password</h2>
        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-muted">
            Nuova password
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            minLength={8}
            required
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-muted">
            Conferma password
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            minLength={8}
            required
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Aggiorna password
        </button>
      </form>

      <DeleteAccountSection requiresPassword={hasEmailProvider} />
    </div>
  );
}
