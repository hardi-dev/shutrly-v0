import { describe, expect, it } from "vitest";

import { renderTemplate, RenderTemplateError, sanitiseTemplateValue } from "./render-template";

function codeOf(work: () => unknown): string | undefined {
  try {
    work();
    return undefined;
  } catch (error) {
    return error instanceof RenderTemplateError ? error.code : "OTHER";
  }
}

describe("renderTemplate", () => {
  it("AC-MSG-016 substitutes allowed variables as plain text", () => {
    const text = renderTemplate("GALLERY_SHARE", "Halo {{clientName}}\n{{galleryUrl}}", {
      clientName: "Rina & Dimas",
      galleryUrl: "https://shutrly.app/g/abc",
    });
    expect(text).toBe("Halo Rina & Dimas\nhttps://shutrly.app/g/abc");
  });

  it("AC-MSG-017 fails with a typed error when a used variable has no value", () => {
    const work = () =>
      renderTemplate("GALLERY_SHARE", "{{projectTitle}} {{galleryUrl}}", { galleryUrl: "u" });
    expect(codeOf(work)).toBe("MISSING_VALUE");
  });

  it("AC-MSG-018 sanitises values and never resolves a placeholder inside a value", () => {
    const text = renderTemplate("GALLERY_SHARE", "{{clientName}} {{galleryUrl}}", {
      clientName: "Rina\u0007 {{galleryPassword}}\r\n",
      galleryUrl: "u",
      galleryPassword: "rahasia",
    });
    expect(text).toBe("Rina {{galleryPassword}} u");
  });

  it("BR-MSG-006 rejects values for variables the type does not allow", () => {
    const work = () =>
      renderTemplate("GALLERY_SHARE", "{{galleryUrl}}", { galleryUrl: "u", invoiceUrl: "i" });
    expect(codeOf(work)).toBe("VARIABLE_NOT_ALLOWED");
  });

  it("refuses invalid content instead of rendering a partial message", () => {
    expect(codeOf(() => renderTemplate("INVOICE_SHARE", "Halo", {}))).toBe("INVALID_CONTENT");
  });

  it("AC-MSG-019 keeps content and values out of the error message", () => {
    try {
      renderTemplate("GALLERY_SHARE", "{{clientName}} {{galleryUrl}}", { galleryUrl: "secret" });
    } catch (error) {
      expect(String(error)).not.toContain("secret");
      expect(String(error)).not.toContain("clientName");
    }
  });
});

describe("sanitiseTemplateValue", () => {
  it("BR-MSG-004 removes control characters except line feeds and normalises line endings", () => {
    expect(sanitiseTemplateValue("\tA\r\nB\rC\u007F\u0000 ")).toBe("A\nB\nC");
  });
});
