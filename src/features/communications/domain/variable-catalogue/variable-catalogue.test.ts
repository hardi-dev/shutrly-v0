import { describe, expect, it } from "vitest";

import {
  allowedVariables,
  isAllowedVariable,
  isTemplateVariable,
  requiredVariable,
} from "./variable-catalogue";

describe("variable catalogue", () => {
  it("BR-MSG-006 gives every type the common variables first", () => {
    expect(allowedVariables("GALLERY_SHARE")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "galleryUrl",
      "galleryPassword",
    ]);
    expect(allowedVariables("SELECTION_REMINDER")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "galleryUrl",
    ]);
    expect(allowedVariables("PAYMENT_REMINDER")).toEqual([
      "clientName",
      "projectTitle",
      "brandName",
      "invoiceNumber",
      "invoiceTotal",
      "invoiceBalance",
      "invoiceUrl",
    ]);
  });

  it("BR-MSG-006 requires the type's link variable", () => {
    expect(requiredVariable("FINAL_DELIVERY")).toBe("galleryUrl");
    expect(requiredVariable("INVOICE_SHARE")).toBe("invoiceUrl");
  });

  it("BR-MSG-006 rejects another type's variables", () => {
    expect(isAllowedVariable("GALLERY_SHARE", "invoiceUrl")).toBe(false);
    expect(isAllowedVariable("INVOICE_SHARE", "galleryPassword")).toBe(false);
    expect(isAllowedVariable("INVOICE_SHARE", "invoiceTotal")).toBe(true);
  });

  it("knows the catalogue's variable names", () => {
    expect(isTemplateVariable("invoiceBalance")).toBe(true);
    expect(isTemplateVariable("namaKlien")).toBe(false);
  });
});
