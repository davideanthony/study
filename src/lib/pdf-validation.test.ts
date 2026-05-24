import { describe, expect, it } from "vitest";
import { isPdfBuffer, validatePdfFile } from "./pdf-validation";

describe("pdf-validation", () => {
  it("accetta header PDF valido", () => {
    const buf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]).buffer;
    expect(isPdfBuffer(buf)).toBe(true);
  });

  it("rifiuta file non PDF", () => {
    const buf = new TextEncoder().encode("not a pdf").buffer;
    expect(isPdfBuffer(buf)).toBe(false);
  });

  it("rifiuta file troppo grande", () => {
    const big = new File([new Uint8Array(101 * 1024 * 1024)], "big.pdf", {
      type: "application/pdf",
    });
    const result = validatePdfFile(big);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("100 MB");
    }
  });
});
