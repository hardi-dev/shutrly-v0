import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "./seed-default-templates";

const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };

describe("seedDefaultTemplates", () => {
  it("AC-MSG-001 gives a workspace exactly the five defaults", async () => {
    const repository = new FakeMessageTemplateRepository();
    await seedDefaultTemplates(repository, context);
    await seedDefaultTemplates(repository, context);
    expect(repository.rows).toHaveLength(5);
    expect(repository.rows.at(0)).toMatchObject({
      type: "GALLERY_SHARE",
      content: DEFAULT_TEMPLATE_CONTENT.GALLERY_SHARE,
      updatedBy: null,
    });
  });
});
