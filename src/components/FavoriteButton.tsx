"use client";

import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/social/actions";

type FavoriteButtonProps = {
  noteId: string;
  initialSaved: boolean;
};

export function FavoriteButton({ noteId, initialSaved }: FavoriteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleFavorite(noteId);
          setSaved((s) => !s);
        })
      }
      className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-sage shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40 disabled:opacity-60"
    >
      {saved ? "★ Salvato" : "☆ Salva"}
    </button>
  );
}
