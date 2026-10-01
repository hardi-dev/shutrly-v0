import { describe, expect, it } from "vitest";

import {
  isTemplateType,
  TEMPLATE_TYPES,
  templateGroupOf,
  templateSlugOf,
  templateTypeFromSlug,
} from "./template-type";

describe("template types", () => {
  it("BR-MSG-002 A-5 lists the five types in journey order", () => {
    expect(TEMPLATE_TYPES).toEqual([
      "GALLERY_SHARE",
      "SELECTION_REMINDER",
      "FINAL_DELIVERY",
      "INVOICE_SHARE",
      "PAYMENT_REMINDER",
    ]);
  });

  it("A-5 groups gallery and invoice templates", () => {
    expect(TEMPLATE_TYPES.map(templateGroupOf)).toEqual([
      "GALLERY",
      "GALLERY",
      "GALLERY",
      "INVOICE",
      "INVOICE",
    ]);
  });

  it("round-trips URL slugs and rejects unknown ones", () => {
    expect(templateSlugOf("PAYMENT_REMINDER")).toBe("payment-reminder");
    for (const type of TEMPLATE_TYPES)
      expect(templateTypeFromSlug(templateSlugOf(type))).toBe(type);
    expect(templateTypeFromSlug("GALLERY_SHARE")).toBeNull();
    expect(templateTypeFromSlug("unknown")).toBeNull();
  });

  it("recognises stored type values", () => {
    expect(isTemplateType("INVOICE_SHARE")).toBe(true);
    expect(isTemplateType("EMAIL")).toBe(false);
  });
});
