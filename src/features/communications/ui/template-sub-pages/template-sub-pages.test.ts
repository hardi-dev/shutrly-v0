import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import { TEMPLATE_COPY_NAMESPACE } from "@/features/communications/ui/template-copy/template-copy.copy";

import { messageTemplateHref, messageTemplateSubPages } from "./template-sub-pages";

describe("messageTemplateSubPages", () => {
  it("AC-MSG-005 gives each editor its heading and the list as its parent", () => {
    const pages = messageTemplateSubPages(copyTranslator(TEMPLATE_COPY_NAMESPACE, "id"), "A");
    expect(pages).toHaveLength(5);
    expect(pages[0]).toEqual({
      path: "/w/A/message-templates/gallery-share",
      title: "Bagikan galeri",
      subtitle:
        "Untuk galeri yang siap dipilih klien. Kamu tetap mengirim setiap pesan sendiri lewat WhatsApp.",
      parent: { label: "Templat pesan", href: "/w/A/message-templates" },
    });
    expect(messageTemplateHref("A", "PAYMENT_REMINDER")).toBe(
      "/w/A/message-templates/payment-reminder",
    );
  });

  it("reads the same sub-pages in English", () => {
    const [first] = messageTemplateSubPages(copyTranslator(TEMPLATE_COPY_NAMESPACE, "en"), "A");
    expect(first).toMatchObject({
      title: "Share gallery",
      subtitle:
        "For when the gallery is ready for client selections. You send each message yourself through WhatsApp.",
      parent: { label: "Message templates" },
    });
  });
});
