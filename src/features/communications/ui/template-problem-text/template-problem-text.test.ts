import { describe, expect, it } from "vitest";

import { templateProblemText } from "./template-problem-text";

describe("templateProblemText", () => {
  it("AC-MSG-009 names the variable and the template, as in the design", () => {
    expect(templateProblemText("GALLERY_SHARE", "UNKNOWN_VARIABLE:invoiceUrl", "id-ID")).toBe(
      "{{invoiceUrl}} tidak bisa dipakai di Bagikan gallery. Pakai variabel dari daftar di bawah.",
    );
  });

  it("AC-MSG-011 says which link is required", () => {
    expect(templateProblemText("GALLERY_SHARE", "MISSING_REQUIRED:galleryUrl", "id-ID")).toBe(
      "Pesan ini wajib memuat {{galleryUrl}} agar klien bisa membuka gallery.",
    );
    expect(templateProblemText("PAYMENT_REMINDER", "MISSING_REQUIRED:invoiceUrl", "id-ID")).toBe(
      "Pesan ini wajib memuat {{invoiceUrl}} agar klien bisa membuka invoice.",
    );
  });

  it("AC-MSG-008 AC-MSG-010 explains empty, too long and malformed content", () => {
    expect(templateProblemText("GALLERY_SHARE", "EMPTY", "id-ID")).toBe(
      "Isi pesan tidak boleh kosong.",
    );
    expect(templateProblemText("GALLERY_SHARE", "TOO_LONG", "id-ID")).toBe(
      "Isi pesan maksimal 2.000 karakter.",
    );
    expect(templateProblemText("GALLERY_SHARE", "MALFORMED", "id-ID")).toContain("{{clientName}}");
  });

  it("returns nothing without an error and a generic message for an unknown key", () => {
    expect(templateProblemText("GALLERY_SHARE", undefined, "id-ID")).toBeUndefined();
    expect(templateProblemText("GALLERY_SHARE", "???", "id-ID")).toBe(
      "Isi pesan belum bisa disimpan.",
    );
  });

  it("AC-L10N-006 formats 2000 with the active locale", () => {
    expect(templateProblemText("GALLERY_SHARE", "TOO_LONG", "id-ID")).toContain("2.000");
    expect(templateProblemText("GALLERY_SHARE", "TOO_LONG", "en-US")).toContain("2,000");
  });
});
