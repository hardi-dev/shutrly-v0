import { describe, expect, it } from "vitest";

import { findTemplateProblem } from "../template-content/template-content";
import { TEMPLATE_TYPES } from "../template-type/template-type";
import { DEFAULT_TEMPLATE_CONTENT } from "./default-templates";

describe("default templates", () => {
  it.each(TEMPLATE_TYPES)("BR-MSG-005 BR-MSG-006 the %s default is valid for its type", (type) => {
    expect(findTemplateProblem(type, DEFAULT_TEMPLATE_CONTENT[type])).toBeNull();
  });

  it("A-10 GALLERY_SHARE matches the approved design copy", () => {
    expect(DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE).toBe(
      "Halo {{clientName}},\n\nGallery untuk {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nSilakan pilih foto favoritmu. Terima kasih!",
    );
  });

  it("A-1 stores defaults already trimmed", () => {
    for (const type of TEMPLATE_TYPES) {
      expect(DEFAULT_TEMPLATE_CONTENT[type]).toBe(DEFAULT_TEMPLATE_CONTENT[type].trim());
    }
  });
});
