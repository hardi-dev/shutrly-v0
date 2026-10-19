import { describe, expect, it } from "vitest";

import { whatsappLink } from "./whatsapp-link";

describe("whatsappLink (BR-MSG-001, ADR-006)", () => {
  it("AC-GFL-022 builds a wa.me deep link with the encoded message", () => {
    const text = "Halo & selamat\nhttps://example.test/g/abc?x=1";
    expect(whatsappLink("6281234567890", text)).toBe(
      "https://wa.me/6281234567890?text=Halo%20%26%20selamat%0Ahttps%3A%2F%2Fexample.test%2Fg%2Fabc%3Fx%3D1",
    );
  });

  it("AC-GFL-022 encodes the message with URL encoding for spaces and newlines", () => {
    expect(whatsappLink("6281234567890", "a b\nc")).toBe(
      "https://wa.me/6281234567890?text=a%20b%0Ac",
    );
  });

  it("BR-MSG-001 returns null without a WhatsApp number", () => {
    expect(whatsappLink(null, "hi")).toBeNull();
  });
});
