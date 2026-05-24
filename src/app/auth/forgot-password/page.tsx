import Link from "next/link";
import { requestPasswordReset } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string; sent?: string }>;
};

export const metadata = { title: "Password dimenticata" };

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { error, sent } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">Password dimenticata</h1>
      <p className="mt-1 text-muted">
        Inserisci la tua email: ti invieremo un link per reimpostare la password.
      </p>

      {sent && (
        <p className="mt-4 rounded-xl border border-sage/30 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          Se l&apos;email è registrata, riceverai a breve un link. Controlla anche lo spam.
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}

      <form action={requestPasswordReset} className="card mt-8 space-y-4 rounded-2xl p-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field mt-1 w-full px-4 py-3"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Invia link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/auth/login" className="font-medium text-sage hover:underline">
          Torna al login
        </Link>
      </p>
    </div>
  );
}
