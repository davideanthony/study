"use client";

import { useState } from "react";

type PdfPreviewProps = {
  fileUrl: string;
  title: string;
};

export function PdfPreview({ fileUrl, title }: PdfPreviewProps) {
  const [embedFailed, setEmbedFailed] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex px-4 py-2 text-sm"
        >
          Apri PDF a schermo intero
        </a>
        <a
          href={fileUrl}
          download
          className="rounded-xl border border-gray-light bg-surface px-4 py-2 text-sm font-medium text-sage shadow-[var(--shadow-soft)] hover:bg-mint-light/40"
        >
          Scarica per visualizzare offline
        </a>
      </div>
      <p className="text-xs text-muted">
        Su iPhone e alcuni browser l&apos;anteprima integrata non funziona: usa i pulsanti sopra.
      </p>
      {!embedFailed ? (
        <div className="card overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
          <object
            data={fileUrl}
            type="application/pdf"
            title={title}
            className="h-[min(70vh,600px)] w-full min-h-[280px] bg-gray-light/30"
            onError={() => setEmbedFailed(true)}
          >
            <iframe
              src={fileUrl}
              title={title}
              className="h-[min(70vh,600px)] w-full"
            />
          </object>
        </div>
      ) : (
        <div className="card rounded-2xl border border-dashed border-sage/30 p-8 text-center text-sm text-muted">
          Anteprima non disponibile in questo browser. Apri il PDF con il pulsante sopra.
        </div>
      )}
    </div>
  );
}
