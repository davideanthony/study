"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { resendConfirmationEmail } from "@/app/auth/actions";

type CheckEmailModalProps = {
  open: boolean;
  email?: string;
  resent?: boolean;
  error?: string;
};

export function CheckEmailModal({ open, email, resent, error }: CheckEmailModalProps) {
  const router = useRouter();

  function handleClose() {
    router.replace("/auth/login");
  }

  return (
    <Modal open={open} onClose={handleClose} title="Controlla la casella">
      <p>
        Ti abbiamo inviato un&apos;email di conferma. Apri il link per attivare
        l&apos;account, poi accedi con email e password.
      </p>
      <p className="mt-2 text-sm text-muted">
        Controlla anche la cartella spam. L&apos;email arriva da{" "}
        <span className="font-medium">noreply@mail.app.supabase.io</span> se non
        hai configurato un provider SMTP personalizzato.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          {decodeURIComponent(error)}
        </p>
      )}

      {resent && (
        <p className="mt-4 rounded-xl border border-sage/20 bg-mint-light/60 px-4 py-3 text-sm text-sage-dark">
          Email inviata di nuovo. Controlla la casella.
        </p>
      )}

      {email && (
        <form action={resendConfirmationEmail} className="mt-4 space-y-3">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            className="w-full rounded-xl border border-gray-light bg-surface px-4 py-2.5 text-sm font-medium text-sage shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40"
          >
            Invia di nuovo l&apos;email di conferma
          </button>
        </form>
      )}
    </Modal>
  );
}
