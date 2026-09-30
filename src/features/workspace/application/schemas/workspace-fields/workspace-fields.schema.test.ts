import { describe, expect, it } from "vitest";

import { updateWorkspaceProfileFieldsSchema } from "./workspace-fields.schema";

const valid = {
  name: "Aster Wedding",
  brandName: "",
  contactEmail: "",
  phone: "",
  address: "",
  invoicePrefix: "AW",
};

function keysFor(input: Partial<typeof valid>): string[] {
  const result = updateWorkspaceProfileFieldsSchema.safeParse({ ...valid, ...input });
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}

describe("updateWorkspaceProfileFieldsSchema", () => {
  it("AC-WS-017 accepts empty optional branding and a lowercase prefix, stored uppercase", () => {
    const result = updateWorkspaceProfileFieldsSchema.parse({ ...valid, invoicePrefix: " aw " });
    expect(result.invoicePrefix).toBe("AW");
  });

  it("AC-WS-017 A-1 reports an empty or over-long name", () => {
    expect(keysFor({ name: "   " })).toEqual(["name.required"]);
    expect(keysFor({ name: "x".repeat(61) })).toEqual(["name.tooLong"]);
  });

  it("AC-WS-017 A-3 reports an invoice prefix outside 2–6 of A–Z0–9", () => {
    expect(keysFor({ invoicePrefix: "A" })).toEqual(["prefix.invalid"]);
    expect(keysFor({ invoicePrefix: "AW-1" })).toEqual(["prefix.invalid"]);
  });

  it("AC-WS-017 A-4 reports invalid optional branding", () => {
    expect(keysFor({ brandName: "x".repeat(81) })).toEqual(["brandName.tooLong"]);
    expect(keysFor({ contactEmail: "halo@aster" })).toEqual(["email.invalid"]);
    expect(keysFor({ phone: "12ab" })).toEqual(["phone.invalid"]);
    expect(keysFor({ address: "x".repeat(301) })).toEqual(["address.tooLong"]);
  });
});
