"use client";

import { useState, useTransition } from "react";
import { bulkReindexPdfText } from "@/app/admin/actions";

type AdminReindexPanelProps = {
  serviceRoleConfigured: boolean;
  totalNotes: number;
};

export function AdminReindexPanel({
  serviceRoleConfigured,
  totalNotes,
}: AdminReindexPanelProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    processed: number;
    updated: number;
    failed: number;
    errors: string[];
    done: boolean;
  } | null>(null);

  function runReindex(all: boolean) {
    startTransition(async () => {
      setResult(null);
      const res = await bulkReindexPdfText(all);
      setResult({ ...res, done: true });
    });
  }

  return (
    <section className="card mt-12 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground">Re-indicizzazione PDF (full-text)</h2>
      <p className="mt-2 text-sm text-muted">
        Estrae di nuovo il testo dai PDF e aggiorna la ricerca full-text. Appunti totali:{" "}
        <strong className="text-foreground">{totalNotes}</strong>.
      </p>
      {!serviceRoleConfigured ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Imposta <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> su Vercel per
          abilitare questa operazione.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => runReindex(false)}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            {pending ? "In corso…" : "Indicizza prossimi 25"}
          </button>
          <button
            type="button"
            disabled={pending || totalNotes === 0}
            onClick={() => runReindex(true)}
            className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-muted shadow-[var(--shadow-soft)] hover:bg-mint-light/40 disabled:opacity-60"
          >
            Indicizza tutti (batch)
          </button>
        </div>
      )}
      {result && (
        <div className="mt-4 rounded-xl border border-sage/20 bg-mint-light/40 px-4 py-3 text-sm text-foreground">
          <p>
            Processati: {result.processed} · Aggiornati: {result.updated} · Errori:{" "}
            {result.failed}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 max-h-32 list-inside list-disc overflow-y-auto text-xs text-muted">
              {result.errors.slice(0, 10).map((e) => (
                <li key={e}>{e}</li>
              ))}
              {result.errors.length > 10 && (
                <li>…e altri {result.errors.length - 10}</li>
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
