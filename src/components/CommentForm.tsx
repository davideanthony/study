"use client";

import { useTransition } from "react";
import { addComment } from "@/app/appunti/[id]/actions";

type CommentFormProps = {
  noteId: string;
};

export function CommentForm({ noteId }: CommentFormProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(() => addComment(noteId, formData));
  }

  return (
    <form action={handleSubmit} className="flex gap-2">
      <input
        type="text"
        name="body"
        required
        maxLength={2000}
        disabled={pending}
        placeholder="Scrivi un commento…"
        className="input-field min-w-0 flex-1 px-4 py-2.5 text-sm shadow-[var(--shadow-soft)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-primary shrink-0 px-4 py-2.5 text-sm disabled:opacity-60"
      >
        {pending ? "…" : "Pubblica"}
      </button>
    </form>
  );
}
