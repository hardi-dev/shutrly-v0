import { FakeWorkspaceRepository } from "@tests/support/workspace/fake-workspace-repository";
import { describe, expect, it } from "vitest";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import { createFirstWorkspace } from "./create-first-workspace";

describe("createFirstWorkspace", () => {
  it("AC-WS-002 creates an IDR workspace with the suggested prefix", async () => {
    const repository = new FakeWorkspaceRepository();
    const result = await createFirstWorkspace(repository, "owner" as never, {
      name: "Aster Wedding",
    });
    expect(repository.records[result.id ? 0 : -1]).toMatchObject({
      name: "Aster Wedding",
      invoicePrefix: "AW",
      currency: "IDR",
      brandName: null,
    });
  });

  it("AC-WS-006 refuses a second first-workspace submission", async () => {
    const repository = new FakeWorkspaceRepository();
    await createFirstWorkspace(repository, "owner" as never, { name: "Aster" });
    await expect(
      createFirstWorkspace(repository, "owner" as never, { name: "Second" }),
    ).rejects.toMatchObject({ code: "ALREADY_HAS_WORKSPACE" } satisfies Partial<WorkspaceError>);
  });
});
