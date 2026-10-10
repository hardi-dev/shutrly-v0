import { describe, expect, it } from "vitest";

import type { AppLocale } from "@/shared/locale/locale.types";

import { findTemplateProblem } from "../template-content/template-content";
import { TEMPLATE_TYPES } from "../template-type/template-type";
import { DEFAULT_TEMPLATE_CONTENT } from "./default-templates";

const LOCALES: readonly AppLocale[] = ["en", "id"];

describe("default templates", () => {
  it.each(TEMPLATE_TYPES)(
    "BR-MSG-005 BR-MSG-006 the %s default is valid in both locales",
    (type) => {
      for (const locale of LOCALES) {
        expect(findTemplateProblem(type, DEFAULT_TEMPLATE_CONTENT[locale][type])).toBeNull();
      }
    },
  );

  it("A-10 GALLERY_SHARE matches the copy deck in both locales", () => {
    expect(DEFAULT_TEMPLATE_CONTENT.en.GALLERY_SHARE).toBe(
      "Hi {{clientName}},\n\nYour gallery for {{projectTitle}} from {{brandName}} is ready:\n{{galleryUrl}}\n\nPassword: {{galleryPassword}}\n\nChoose your favorite photos. Thank you!",
    );
    expect(DEFAULT_TEMPLATE_CONTENT.id.GALLERY_SHARE).toBe(
      "Halo {{clientName}},\n\nGaleri {{projectTitle}} dari {{brandName}} sudah bisa dibuka:\n{{galleryUrl}}\n\nKata sandi: {{galleryPassword}}\n\nPilih foto favoritmu, ya. Terima kasih!",
    );
  });

  it("A-1 stores defaults already trimmed", () => {
    for (const locale of LOCALES) {
      for (const type of TEMPLATE_TYPES) {
        const content = DEFAULT_TEMPLATE_CONTENT[locale][type];
        expect(content).toBe(content.trim());
      }
    }
  });
});
