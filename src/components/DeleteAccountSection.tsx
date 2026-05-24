"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/profilo/actions";

type DeleteAccountSectionProps = {
  /** Account email/password: richiede password oltre alla frase ELIMINA. */
  requiresPassword?: boolean;
};

export function DeleteAccountSection({
  requiresPassword = true,
}: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="card mt-8 rounded-2xl border border-red-200/60 p-6">
      <h2 className="font-semibold text-foreground">Elimina account</h2>
      <p className="mt-2 text-sm text-muted">
        Rimuove definitivamente il tuo profilo, tutti gli appunti caricati, like,
        commenti e notifiche. Questa azione non è reversibile.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Elimina il mio account…
        </button>
      ) : (
        <form action={deleteAccount} className="mt-4 space-y-4">
          <p className="text-sm text-muted">
            Digita <strong className="text-foreground">ELIMINA</strong>
            {requiresPassword
              ? " e la tua password per confermare."
              : " per confermare (accesso OAuth)."}
          </p>
          <div>
            <label htmlFor="confirm_phrase" className="block text-sm font-medium text-muted">
              Conferma
            </label>
            <input
              id="confirm_phrase"
              name="confirm_phrase"
              required
              autoComplete="off"
              className="input-field mt-1 w-full px-4 py-3"
              placeholder="ELIMINA"
            />
          </div>
          {requiresPassword && (
            <div>
              <label htmlFor="delete_password" className="block text-sm font-medium text-muted">
                Password attuale
              </label>
              <input
                id="delete_password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field mt-1 w-full px-4 py-3"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Elimina definitivamente
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-gray-light px-4 py-2 text-sm text-muted hover:bg-mint-light/30"
            >
              Annulla
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
