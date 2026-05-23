"use client";

import { useTransition } from "react";
import { deleteNote } from "@/app/profilo/actions";

type DeleteNoteButtonProps = {
  noteId: string;
  noteTitle: string;
  redirectTo?: string;
  className?: string;
};

export function DeleteNoteButton({
  noteId,
  noteTitle,
  redirectTo = "/profilo",
  className,
}: DeleteNoteButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const ok = window.confirm(
      `Eliminare "${noteTitle}"? L'operazione non si può annullare.`,
    );
    if (!ok) return;

    startTransition(() => deleteNote(noteId, redirectTo));
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className={
        className ??
        "rounded-xl border border-red-200 bg-red-50/80 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      }
    >
      {pending ? "Eliminazione…" : "Elimina appunto"}
    </button>
  );
}
