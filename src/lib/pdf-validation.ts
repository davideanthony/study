/** Limite upload PDF (byte). */
export const MAX_PDF_BYTES = 20 * 1024 * 1024;

/** Caratteri massimi salvati per ricerca full-text. */
export const MAX_PDF_TEXT_CHARS = 2_000_000;

export function formatMaxPdfSize(): string {
  return "20 MB";
}

/** Verifica magic bytes PDF (%PDF). */
export function isPdfBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 5) return false;
  const header = new Uint8Array(buffer.slice(0, 5));
  const sig = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  return sig.every((b, i) => header[i] === b);
}

export function validatePdfFile(file: File): { ok: true } | { ok: false; error: string } {
  if (file.size === 0) {
    return { ok: false, error: "Il file PDF è vuoto." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return {
      ok: false,
      error: `Il PDF supera il limite di ${formatMaxPdfSize()}. Comprimi il file o dividilo in più parti.`,
    };
  }
  if (file.type && file.type !== "application/pdf") {
    return { ok: false, error: "Solo file PDF sono ammessi." };
  }
  return { ok: true };
}

export async function validatePdfFileContent(
  file: File,
): Promise<{ ok: true; buffer: ArrayBuffer } | { ok: false; error: string }> {
  const basic = validatePdfFile(file);
  if (!basic.ok) return basic;

  const buffer = await file.arrayBuffer();
  if (!isPdfBuffer(buffer)) {
    return { ok: false, error: "Il file non sembra un PDF valido." };
  }
  return { ok: true, buffer };
}
