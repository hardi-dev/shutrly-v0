import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { updateMessageTemplate } from "./update-message-template";

async function seeded() {
  const repository = new FakeMessageTemplateRepository();
  const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
  await seedDefaultTemplates(repository, context);
  return { repository, context };
}

describe("updateMessageTemplate", () => {
  it("AC-MSG-007 A-9 stores trimmed content for that type only and records the editor", async () => {
    const { repository, context } = await seeded();
    const content = "Halo {{clientName}}, invoice {{invoiceNumber}}: {{invoiceUrl}}";
    const result = await updateMessageTemplate(repository, context, {
      type: "INVOICE_SHARE",
      editorUserId: "owner_1",
      input: { content: `  ${content}\n` },
    });
    expect(result).toEqual({ ok: true });
    const invoice = await repository.findByType(context, "INVOICE_SHARE");
    expect(invoice).toMatchObject({ content, updatedBy: "owner_1" });
    const reminder = await repository.findByType(context, "PAYMENT_REMINDER");
    expect(reminder?.content).toBe(DEFAULT_TEMPLATE_CONTENT.PAYMENT_REMINDER);
  });

  it.each([
    [" \n ", "EMPTY"],
    ["{{galleryUrl}} {{invoiceUrl}}", "UNKNOWN_VARIABLE:invoiceUrl"],
    ["{{galleryUrl}} {{ clientName }}", "MALFORMED"],
    ["Halo {{clientName}}", "MISSING_REQUIRED:galleryUrl"],
  ])("AC-MSG-008…011 refuses %j and stores nothing", async (content, key) => {
    const { repository, context } = await seeded();
    const result = await updateMessageTemplate(repository, context, {
      type: "GALLERY_SHARE",
      editorUserId: "owner_1",
      input: { content },
    });
    expect(result).toEqual({ ok: false, code: "VALIDATION_FAILED", fieldErrors: { content: key } });
    const gallery = await repository.findByType(context, "GALLERY_SHARE");
    expect(gallery?.content).toBe(DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE);
  });

  it("AC-MSG-015 is not found when the workspace has no such template", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(
      updateMessageTemplate(repository, context, {
        type: "GALLERY_SHARE",
        editorUserId: "owner_1",
        input: { content: "{{galleryUrl}}" },
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
