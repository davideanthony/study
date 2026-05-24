import { MAX_PDF_TEXT_CHARS } from "@/lib/pdf-validation";

/** Estrae testo da PDF per ricerca full-text. PDF scansionati → stringa vuota. */
export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(Buffer.from(buffer), { max: 0 });
    const text = (result.text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_PDF_TEXT_CHARS);
    return text;
  } catch (err) {
    console.warn("[extractPdfText] estrazione fallita:", err);
    return "";
  }
}
