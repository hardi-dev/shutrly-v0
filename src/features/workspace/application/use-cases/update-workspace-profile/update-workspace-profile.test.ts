import { FakeWorkspaceRepository } from "@tests/support/workspace/fake-workspace-repository";
import { describe, expect, it } from "vitest";

import { createWorkspace } from "../create-workspace/create-workspace";
import { updateWorkspaceProfile } from "./update-workspace-profile";

describe("updateWorkspaceProfile", () => {
  it("AC-WS-017 normalises the prefix and updates only the verified row", async () => {
    const repository = new FakeWorkspaceRepository();
    const created = await createWorkspace(repository, "owner" as never, { name: "Aster" });
    await updateWorkspaceProfile(
      repository,
      { workspaceId: created.id },
      {
        name: "Aster Studio",
        brandName: "Aster",
        contactEmail: "owner@example.com",
        phone: "0812345678",
        address: "Jakarta",
        invoicePrefix: "as",
      },
    );
    expect(repository.records[0]).toMatchObject({ name: "Aster Studio", invoicePrefix: "AS" });
  });
});
