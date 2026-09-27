import { describe, expect, it } from "vitest";

import { normaliseInvoicePrefix, suggestInvoicePrefix } from "./invoice-prefix";

describe("suggestInvoicePrefix", () => {
  it("AC-WS-005 uses initials and the documented fallbacks", () => {
    expect(suggestInvoicePrefix("Aster Wedding")).toBe("AW");
    expect(suggestInvoicePrefix("Studio")).toBe("STU");
    expect(suggestInvoicePrefix("Foto Keluarga Bahagia Sentosa Abadi Jaya")).toBe("FKBSAJ");
    expect(suggestInvoicePrefix("@@")).toBe("INV");
  });

  it("AC-WS-005 folds accented letters before filtering", () => {
    expect(suggestInvoicePrefix("Élan Studio")).toBe("ES");
  });
});

describe("normaliseInvoicePrefix", () => {
  it("AC-WS-017 stores a valid lowercase prefix as uppercase", () => {
    expect(normaliseInvoicePrefix(" aw ")).toBe("AW");
  });

  it("AC-WS-017 rejects prefixes outside the A-3 format", () => {
    expect(() => normaliseInvoicePrefix("A")).toThrow();
    expect(() => normaliseInvoicePrefix("A-1")).toThrow();
    expect(() => normaliseInvoicePrefix("TOOLONG")).toThrow();
  });
});
