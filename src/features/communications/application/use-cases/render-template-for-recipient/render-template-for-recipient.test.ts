import { describe, expect, it } from "vitest";

import { renderTemplateForRecipient } from "./render-template-for-recipient";

const values = {
  clientName: "Rina",
  projectTitle: "Wisuda Ayu",
  brandName: "Studio Cahaya",
  galleryUrl: "https://shutrly.test/g/abc",
  galleryPassword: "k3y-9X",
};

describe("renderTemplateForRecipient", () => {
  it("AC-L10N-010 a platform default renders in the recipient language", () => {
    const template = { type: "GALLERY_SHARE" as const, isDefault: true, content: null };
    expect(renderTemplateForRecipient(template, "en", values)).toContain("Hi Rina,");
    expect(renderTemplateForRecipient(template, "id", values)).toContain("Halo Rina,");
  });

  it("AC-L10N-010 a custom template ignores the language for its text", () => {
    const template = {
      type: "GALLERY_SHARE" as const,
      isDefault: false,
      content: "Halo {{clientName}}, buka {{galleryUrl}}",
    };
    expect(renderTemplateForRecipient(template, "en", values)).toBe(
      "Halo Rina, buka https://shutrly.test/g/abc",
    );
  });
});
