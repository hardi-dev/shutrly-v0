import { describe, expect, it } from "vitest";

import { messageTemplateContentSchema } from "./message-template-content.schema";

describe("messageTemplateContentSchema", () => {
  it("C-004 accepts valid content for the type", () => {
    const result = messageTemplateContentSchema("GALLERY_SHARE").safeParse({
      content: "Halo {{clientName}} {{galleryUrl}}",
    });
    expect(result.success).toBe(true);
  });

  it("AC-MSG-009 reports the problem key as the issue message", () => {
    const result = messageTemplateContentSchema("GALLERY_SHARE").safeParse({
      content: "{{galleryUrl}} {{invoiceUrl}}",
    });
    expect(result.error?.issues[0]?.message).toBe("UNKNOWN_VARIABLE:invoiceUrl");
  });
});
