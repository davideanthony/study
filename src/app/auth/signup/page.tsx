import Link from "next/link";
import { CheckEmailModal } from "@/components/CheckEmailModal";
import { OAuthButtons } from "@/components/OAuthButtons";
import { resendConfirmationEmail, signUp } from "../actions";

type PageProps = {
  searchParams: Promise<{ error?: string; check_email?: string; email?: string; resent?: string }>;
};

export const metadata = { title: "Registrati" };

export default async function SignupPage({ searchParams }: PageProps) {
  const { error, check_email, email, resent } = await searchParams;
  const showCheckEmail = check_email === "1";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <CheckEmailModal
        open={showCheckEmail}
        email={email}
        resent={resent === "1"}
        error={showCheckEmail ? error : undefined}
      />
      <h1 className="text-2xl font-bold text-foreground">Crea account</h1>
      <p className="mt-1 text-muted">Inizia a condividere i tuoi appunti</p>

      {error && !showCheckEmail && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark shadow-[var(--shadow-soft)]">
          {decodeURIComponent(error)}
        </p>
      )}

      {email && !showCheckEmail && (
        <form action={resendConfirmationEmail} className="mt-4">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-light bg-surface px-4 py-2.5 text-sm font-medium text-sage shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
          >
            Invia di nuovo l&apos;email di conferma
          </button>
        </form>
      )}

      <form
        action={signUp}
        className="card mt-8 space-y-4 rounded-2xl p-6"
      >
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-muted">
            Username <span className="font-normal">(unico)</span>
          </label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={24}
            pattern="[a-zA-Z0-9_]+"
            autoComplete="username"
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
            placeholder="es. mario_rossi"
          />
          <p className="mt-1 text-xs text-muted">
            Lettere, numeri e underscore. Non può essere uguale a un altro account.
          </p>
        </div>
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-muted">
            Nome visualizzato <span className="font-normal">(opzionale)</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
            placeholder="Come ti vedono gli altri"
          />
          <p className="mt-1 text-xs text-muted">
            Può essere uguale al nome di altri utenti.
          </p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input-field mt-1 w-full px-4 py-3 shadow-[var(--shadow-soft)]"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Registrati
        </button>
      </form>

      <div className="card mt-6 rounded-2xl p-6">
        <OAuthButtons />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Hai già un account?{" "}
        <Link href="/auth/login" className="font-medium text-sage hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}
