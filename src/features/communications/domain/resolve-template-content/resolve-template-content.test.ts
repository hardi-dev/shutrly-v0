import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "../default-templates/default-templates";
import { placeholdersIn } from "../template-content/template-content";
import { TEMPLATE_TYPES } from "../template-type/template-type";
import { resolveTemplateContent } from "./resolve-template-content";

describe("resolveTemplateContent", () => {
  it.each(TEMPLATE_TYPES)(
    "AC-L10N-008 a default %s resolves to the text of the requested language",
    (type) => {
      expect(resolveTemplateContent({ isDefault: true, content: null, type }, "en")).toBe(
        DEFAULT_TEMPLATE_CONTENT.en[type],
      );
      expect(resolveTemplateContent({ isDefault: true, content: null, type }, "id")).toBe(
        DEFAULT_TEMPLATE_CONTENT.id[type],
      );
    },
  );

  it("AC-L10N-008 a custom template returns its stored text whatever the language", () => {
    const template = {
      isDefault: false,
      content: "Halo {{clientName}}",
      type: "GALLERY_SHARE" as const,
    };
    expect(resolveTemplateContent(template, "en")).toBe("Halo {{clientName}}");
    expect(resolveTemplateContent(template, "id")).toBe("Halo {{clientName}}");
  });

  it("AC-L10N-008 a custom template without content is an invariant violation", () => {
    expect(() =>
      resolveTemplateContent({ isDefault: false, content: null, type: "GALLERY_SHARE" }, "en"),
    ).toThrow("custom template has no content");
  });

  it.each(TEMPLATE_TYPES)(
    "AC-L10N-008 the %s EN and ID defaults use the same placeholders",
    (type) => {
      expect(
        placeholdersIn(DEFAULT_TEMPLATE_CONTENT.en[type]).sort((a, b) => a.localeCompare(b)),
      ).toEqual(
        placeholdersIn(DEFAULT_TEMPLATE_CONTENT.id[type]).sort((a, b) => a.localeCompare(b)),
      );
    },
  );
});
