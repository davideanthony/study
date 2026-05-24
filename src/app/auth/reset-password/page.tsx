import Link from "next/link";
import { updatePassword } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const metadata = { title: "Nuova password" };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">Imposta nuova password</h1>
      <p className="mt-1 text-muted">Scegli una password sicura (minimo 8 caratteri).</p>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={updatePassword} className="card mt-8 space-y-4 rounded-2xl p-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted">
            Nuova password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-muted">
            Conferma password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Salva password
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/auth/login" className="font-medium text-sage hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
