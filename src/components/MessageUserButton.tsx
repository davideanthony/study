"use client";

import { useTransition } from "react";
import { getOrCreateConversation } from "@/app/messaggi/actions";

type MessageUserButtonProps = {
  targetUserId: string;
};

export function MessageUserButton({ targetUserId }: MessageUserButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await getOrCreateConversation(targetUserId);
        })
      }
      className="rounded-xl border border-sage/40 bg-mint-light/50 px-4 py-2 text-sm font-medium text-sage-dark transition hover:bg-mint-light disabled:opacity-60"
    >
      {pending ? "Apertura…" : "Messaggio"}
    </button>
  );
}
