"use client";

import { useState, useTransition } from "react";
import { toggleBlock } from "@/app/social/actions";

type BlockButtonProps = {
  targetUserId: string;
  initialBlocked: boolean;
};

export function BlockButton({ targetUserId, initialBlocked }: BlockButtonProps) {
  const [pending, startTransition] = useTransition();
  const [blocked, setBlocked] = useState(initialBlocked);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleBlock(targetUserId);
          setBlocked((b) => !b);
        })
      }
      className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm text-muted shadow-[var(--shadow-soft)] transition hover:bg-mint-light/40 disabled:opacity-60"
    >
      {blocked ? "Sblocca" : "Blocca utente"}
    </button>
  );
}
