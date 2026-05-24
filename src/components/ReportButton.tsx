"use client";

import { useState } from "react";
import { REPORT_REASONS } from "@/lib/constants";
import { reportContent } from "@/app/social/actions";

type ReportButtonProps = {
  noteId?: string;
  commentId?: string;
  returnTo: string;
};

export function ReportButton({ noteId, commentId, returnTo }: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  if (!noteId && !commentId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline-offset-2 hover:text-sage hover:underline"
      >
        Segnala
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            action={reportContent}
            className="card w-full max-w-md space-y-4 rounded-2xl p-6"
          >
            <h3 className="font-semibold text-foreground">Segnala contenuto</h3>
            {noteId && <input type="hidden" name="note_id" value={noteId} />}
            {commentId && <input type="hidden" name="comment_id" value={commentId} />}
            <input type="hidden" name="return_to" value={returnTo} />
            <div>
              <label htmlFor="reason" className="text-sm text-muted">
                Motivo
              </label>
              <select
                id="reason"
                name="reason"
                required
                className="input-field mt-1 w-full px-3 py-2 text-sm"
              >
                <option value="">Seleziona…</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="details" className="text-sm text-muted">
                Dettagli (opzionale)
              </label>
              <textarea
                id="details"
                name="details"
                rows={3}
                className="input-field mt-1 w-full px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 py-2 text-sm">
                Invia segnalazione
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-light px-4 py-2 text-sm text-muted"
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
