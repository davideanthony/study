import "server-only";

const MAX_THUMB_WIDTH = 420;

/** Prima pagina del PDF come JPEG (null se rendering non disponibile). */
export async function renderPdfFirstPageThumbnail(
  buffer: ArrayBuffer,
): Promise<Buffer | null> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const { createCanvas } = await import("@napi-rs/canvas");

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      disableFontFace: true,
      useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(MAX_THUMB_WIDTH / baseViewport.width, 1.5);
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(
      Math.max(1, Math.floor(viewport.width)),
      Math.max(1, Math.floor(viewport.height)),
    );
    const ctx = canvas.getContext("2d");
    await page.render({
      canvasContext: ctx as unknown as CanvasRenderingContext2D,
      viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    return canvas.encode("jpeg", 82);
  } catch (err) {
    console.warn("[renderPdfFirstPageThumbnail]", err);
    return null;
  }
}

export function noteThumbnailStoragePath(userId: string, noteId: string): string {
  return `${userId}/${noteId}-thumb.jpg`;
}
