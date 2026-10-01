import { FakeMessageTemplateRepository } from "@tests/support/communications/fake-message-template-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultTemplates } from "../seed-default-templates/seed-default-templates";
import { listMessageTemplates } from "./list-message-templates";

describe("listMessageTemplates", () => {
  it("AC-MSG-004 returns only the workspace's templates in journey order", async () => {
    const repository = new FakeMessageTemplateRepository();
    const mine = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await seedDefaultTemplates(repository, { workspaceId: asWorkspaceId(crypto.randomUUID()) });
    await seedDefaultTemplates(repository, mine);
    repository.rows.reverse();
    const list = await listMessageTemplates(repository, mine);
    expect(list.map((record) => record.type)).toEqual([
      "GALLERY_SHARE",
      "SELECTION_REMINDER",
      "FINAL_DELIVERY",
      "INVOICE_SHARE",
      "PAYMENT_REMINDER",
    ]);
  });
});
