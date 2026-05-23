"use client";

import { useTransition } from "react";
import { recordDownload } from "@/app/appunti/[id]/actions";

type DownloadButtonProps = {
  noteId: string;
  fileUrl: string;
  fileName: string;
};

export function DownloadButton({ noteId, fileUrl, fileName }: DownloadButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      await recordDownload(noteId);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={pending}
      className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
    >
      {pending ? "Download…" : "Scarica PDF"}
    </button>
  );
}
