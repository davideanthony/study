"use client";

import { useTransition } from "react";
import { deleteComment } from "@/app/appunti/[id]/actions";

type DeleteCommentButtonProps = {
  commentId: string;
  noteId: string;
};

export function DeleteCommentButton({
  commentId,
  noteId,
}: DeleteCommentButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => deleteComment(commentId, noteId))}
      className="shrink-0 text-xs text-muted transition hover:text-[#e25555] disabled:opacity-50"
      aria-label="Elimina commento"
    >
      Elimina
    </button>
  );
}
