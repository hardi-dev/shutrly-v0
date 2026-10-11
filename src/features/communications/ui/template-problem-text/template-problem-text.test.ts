import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { TEMPLATE_COPY_NAMESPACE } from "@/features/communications/ui/template-copy/template-copy.copy";

import { templateProblemText } from "./template-problem-text";

const id = copyTranslator(TEMPLATE_COPY_NAMESPACE, "id");
const en = copyTranslator(TEMPLATE_COPY_NAMESPACE, "en");

describe("templateProblemText", () => {
  it("AC-MSG-009 names the variable and the template, as in the design", () => {
    expect(templateProblemText(id, "GALLERY_SHARE", "UNKNOWN_VARIABLE:invoiceUrl")).toBe(
      "{{invoiceUrl}} tidak bisa dipakai di Bagikan galeri. Pilih variabel dari daftar di bawah.",
    );
    expect(templateProblemText(en, "GALLERY_SHARE", "UNKNOWN_VARIABLE:invoiceUrl")).toBe(
      "{{invoiceUrl}} isn’t supported in Share gallery. Use a variable from the list below.",
    );
  });

  it("AC-MSG-011 says which link is required", () => {
    expect(templateProblemText(id, "GALLERY_SHARE", "MISSING_REQUIRED:galleryUrl")).toBe(
      "Sertakan {{galleryUrl}} agar klien bisa membuka galeri.",
    );
    expect(templateProblemText(en, "PAYMENT_REMINDER", "MISSING_REQUIRED:invoiceUrl")).toBe(
      "Include {{invoiceUrl}} so the client can open the invoice.",
    );
  });

  it("AC-MSG-008 AC-MSG-010 explains empty, too long and malformed content", () => {
    expect(templateProblemText(id, "GALLERY_SHARE", "EMPTY")).toBe("Isi pesan.");
    expect(templateProblemText(id, "GALLERY_SHARE", "MALFORMED")).toBe(
      "Tulis variabel sebagai {{variableName}} tanpa spasi, misalnya {{clientName}}.",
    );
    expect(templateProblemText(en, "GALLERY_SHARE", "MALFORMED")).toBe(
      "Write variables as {{variableName}}, without spaces, for example {{clientName}}.",
    );
  });

  it("returns nothing without an error and the generic message for an unknown key", () => {
    expect(templateProblemText(id, "GALLERY_SHARE", undefined)).toBeUndefined();
    expect(templateProblemText(id, "GALLERY_SHARE", "???")).toBe(
      "Pesan ini belum bisa disimpan. Cek isinya.",
    );
  });

  it("AC-L10N-006 formats the limit with the active locale", () => {
    expect(templateProblemText(id, "GALLERY_SHARE", "TOO_LONG")).toBe(
      "Gunakan maksimal 2.000 karakter.",
    );
    expect(templateProblemText(en, "GALLERY_SHARE", "TOO_LONG")).toBe(
      "Use no more than 2,000 characters.",
    );
  });
});
