"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { recordDownload } from "@/app/appunti/[id]/actions";
import { trackPlausibleEvent } from "@/lib/plausible";

type DownloadButtonProps = {
  noteId: string;
  fileUrl: string;
  fileName: string;
  isLoggedIn: boolean;
};

export function DownloadButton({
  noteId,
  fileUrl,
  fileName,
  isLoggedIn,
}: DownloadButtonProps) {
  const [pending, startTransition] = useTransition();
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);

  function triggerDownload() {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function handleDownload() {
    setRateLimitMessage(null);
    startTransition(async () => {
      if (isLoggedIn) {
        const result = await recordDownload(noteId);
        if (!result.ok) {
          setRateLimitMessage(
            "Hai raggiunto il limite di download per ora. Riprova più tardi.",
          );
          return;
        }
      }
      trackPlausibleEvent("note_download");
      triggerDownload();
    });
  }

  function handleGuestDownload() {
    trackPlausibleEvent("note_download");
    triggerDownload();
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleGuestDownload}
          className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          Scarica PDF
        </button>
        <p className="text-xs text-muted">
          <Link href="/auth/login" className="font-medium text-sage hover:underline">
            Accedi
          </Link>{" "}
          per far contare il download nelle statistiche.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={pending}
        className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
      >
        {pending ? "Download…" : "Scarica PDF"}
      </button>
      {rateLimitMessage ? (
        <p className="text-xs text-amber-800">{rateLimitMessage}</p>
      ) : null}
    </div>
  );
}
