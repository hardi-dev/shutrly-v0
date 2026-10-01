import { describe, expect, it } from "vitest";

import {
  findTemplateProblem,
  normaliseTemplateContent,
  parseProblemKey,
  placeholdersIn,
  problemKeyFor,
  TEMPLATE_CONTENT_MAX_LENGTH,
  templateContentLength,
  toProblemKey,
} from "./template-content";

const VALID = "Halo {{clientName}}\n{{galleryUrl}}";

describe("template content", () => {
  it("A-1 trims leading and trailing whitespace but keeps inner line breaks", () => {
    expect(normaliseTemplateContent("  Halo\n\nKak  \n")).toBe("Halo\n\nKak");
  });

  it("AC-MSG-008 rejects whitespace-only content", () => {
    expect(findTemplateProblem("GALLERY_SHARE", " \n\t ")).toEqual({ code: "EMPTY" });
  });

  it("AC-MSG-008 A-1 accepts 2,000 characters after trimming and rejects 2,001", () => {
    const base = "{{galleryUrl}}";
    const atLimit = base + "a".repeat(TEMPLATE_CONTENT_MAX_LENGTH - base.length);
    expect(findTemplateProblem("GALLERY_SHARE", `  ${atLimit}  `)).toBeNull();
    expect(findTemplateProblem("GALLERY_SHARE", `${atLimit}a`)).toEqual({ code: "TOO_LONG" });
  });

  it("A-1 counts characters as code points, like Postgres char_length", () => {
    expect(templateContentLength(" 📷a ")).toBe(2);
  });

  it.each(["{{clientName}", "{{ clientName }}", "{{}}", "Halo }}", "{{Client}}"])(
    "AC-MSG-010 rejects the malformed placeholder %s",
    (snippet) => {
      expect(findTemplateProblem("GALLERY_SHARE", `${VALID} ${snippet}`)).toEqual({
        code: "MALFORMED",
      });
    },
  );

  it("A-2 allows single braces as literal text", () => {
    expect(findTemplateProblem("GALLERY_SHARE", `${VALID} {senyum}`)).toBeNull();
  });

  it.each(["invoiceUrl", "namaKlien"])(
    "AC-MSG-009 names the variable %s that GALLERY_SHARE does not allow",
    (name) => {
      expect(findTemplateProblem("GALLERY_SHARE", `${VALID} {{${name}}}`)).toEqual({
        code: "UNKNOWN_VARIABLE",
        variable: name,
      });
    },
  );

  it("AC-MSG-011 requires the invoice link in PAYMENT_REMINDER", () => {
    expect(findTemplateProblem("PAYMENT_REMINDER", "Halo {{clientName}}")).toEqual({
      code: "MISSING_REQUIRED",
      variable: "invoiceUrl",
    });
  });

  it.each(["GALLERY_SHARE", "SELECTION_REMINDER", "FINAL_DELIVERY"] as const)(
    "AC-MSG-011 requires the gallery link in %s",
    (type) => {
      expect(findTemplateProblem(type, "Halo {{clientName}}")).toEqual({
        code: "MISSING_REQUIRED",
        variable: "galleryUrl",
      });
    },
  );

  it("lists placeholder names in order", () => {
    expect(placeholdersIn("{{a}} x {{bC}} {{a}}")).toEqual(["a", "bC", "a"]);
  });

  it("round-trips problem keys", () => {
    const problem = { code: "UNKNOWN_VARIABLE", variable: "invoiceUrl" } as const;
    expect(toProblemKey(problem)).toBe("UNKNOWN_VARIABLE:invoiceUrl");
    expect(parseProblemKey("UNKNOWN_VARIABLE:invoiceUrl")).toEqual(problem);
    expect(parseProblemKey("TOO_LONG")).toEqual({ code: "TOO_LONG" });
    expect(parseProblemKey("MISSING_REQUIRED")).toBeNull();
    expect(parseProblemKey("nope")).toBeNull();
    expect(problemKeyFor("GALLERY_SHARE", "")).toBe("EMPTY");
    expect(problemKeyFor("GALLERY_SHARE", 42)).toBe("EMPTY");
  });
});
