import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { getMessageTemplate } from "./get-message-template";

describe("getMessageTemplate", () => {
  it("AC-MSG-005 returns the stored template for the type", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await seedDefaultTemplates(repository, context);
    await expect(getMessageTemplate(repository, context, "FINAL_DELIVERY")).resolves.toMatchObject({
      type: "FINAL_DELIVERY",
    });
  });

  it("AC-MSG-015 is not found in a workspace without that template", async () => {
    const repository = new FakeMessageTemplateRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(getMessageTemplate(repository, context, "GALLERY_SHARE")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
