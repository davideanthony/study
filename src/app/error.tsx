"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">Qualcosa è andato storto</h1>
      <p className="mt-3 text-sm text-muted">
        Si è verificato un errore imprevisto. Puoi riprovare o tornare alla home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={reset} className="btn-primary px-6 py-2.5 text-sm">
          Riprova
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-light bg-surface px-6 py-2.5 text-sm font-medium text-muted shadow-[var(--shadow-soft)] hover:bg-mint-light/40"
        >
          Vai alla home
        </Link>
      </div>
    </div>
  );
}
