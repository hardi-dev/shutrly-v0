import { describe, expect, it } from "vitest";

import { formatWhatsappNumber, whatsappChatUrl } from "./whatsapp-number";
import { optionalWhatsappNumberSchema, whatsappNumberSchema } from "./whatsapp-number.schema";

describe("WhatsApp number (BR-CLI-002)", () => {
  it.each([
    "0812 3456 7890",
    "+62 812-3456-7890",
    "62812.3456.7890",
    "812 3456 7890",
    "(0812) 3456-7890",
  ])("AC-CLI-009 normalizes %s to 6281234567890", (raw) => {
    expect(whatsappNumberSchema.parse(raw)).toBe("6281234567890");
  });

  it("AC-CLI-009 keeps a foreign number with its country code", () => {
    expect(whatsappNumberSchema.parse("+1 415 555 0100")).toBe("14155550100");
  });

  it.each([
    "0812",
    "abc",
    "+62 812 3456 7890 1234 5",
    "00812345678",
    "620812345678",
    "+0812345678",
  ])("AC-CLI-009 rejects %s", (raw) => {
    expect(whatsappNumberSchema.safeParse(raw).error?.issues[0]?.message).toBe("INVALID");
  });

  it("AC-CLI-007 treats a blank field as no number", () => {
    expect(optionalWhatsappNumberSchema.parse("  ")).toBeNull();
    expect(optionalWhatsappNumberSchema.parse(" - ")).toBeNull();
    expect(optionalWhatsappNumberSchema.parse("0812-3456-7890")).toBe("6281234567890");
  });

  it("AC-CLI-001 formats Indonesian and foreign numbers (A-7)", () => {
    expect(formatWhatsappNumber("6281234567890")).toBe("+62 812-3456-7890");
    expect(formatWhatsappNumber("6281322004512")).toBe("+62 813-2200-4512");
    expect(formatWhatsappNumber("14155550100")).toBe("+14155550100");
  });

  it("AC-CLI-012 parses its own display form back to the stored number", () => {
    expect(whatsappNumberSchema.parse(formatWhatsappNumber("6281234567890"))).toBe("6281234567890");
  });

  it("AC-CLI-016 builds a plain chat link without text (A-6)", () => {
    expect(whatsappChatUrl("6281234567890")).toBe("https://wa.me/6281234567890");
  });
});
