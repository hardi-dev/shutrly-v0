import { describe, expect, it } from "vitest";

import { messageTemplateHref, messageTemplateSubPages } from "./template-sub-pages";

describe("messageTemplateSubPages", () => {
  it("AC-MSG-005 gives each editor its heading and the list as its parent", () => {
    const pages = messageTemplateSubPages("A");
    expect(pages).toHaveLength(5);
    expect(pages[0]).toEqual({
      path: "/w/A/message-templates/gallery-share",
      title: "Bagikan gallery",
      subtitle:
        "Dikirim saat gallery siap dipilih klien. Kamu tetap mengirimnya sendiri dari WhatsApp.",
      parent: { label: "Template pesan", href: "/w/A/message-templates" },
    });
    expect(messageTemplateHref("A", "PAYMENT_REMINDER")).toBe(
      "/w/A/message-templates/payment-reminder",
    );
  });
});
