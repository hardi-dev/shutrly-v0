import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeClientRepository } from "../../../../../../tests/support/booking/fake-client-repository";
import { countClients } from "./count-clients";

describe("countClients", () => {
  it("AC-CLI-021 counts status within the workspace", async () => {
    const repository = new FakeClientRepository();
    const first = { workspaceId: "one" } as unknown as WorkspaceContext;
    const second = { workspaceId: "two" } as unknown as WorkspaceContext;
    await repository.create(first, {
      name: "A",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: "user",
    });
    await repository.create(second, {
      name: "B",
      whatsappNumber: null,
      socialLinks: [],
      editorUserId: "user",
    });
    expect(await countClients(repository, first, "ACTIVE")).toBe(1);
  });
});
