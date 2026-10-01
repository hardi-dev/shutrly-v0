import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { listWorkspaceSources } from "./list-workspace-sources";

describe("listWorkspaceSources", () => {
  it("AC-SRC-003 returns active sources first, then names", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "zeta",
      editorUserId: "owner_1",
    });
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Alpha",
      editorUserId: "owner_1",
    });
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Beta",
      editorUserId: "owner_1",
    });
    await repository.setActive(context, {
      id: repository.rows[2]?.id ?? "",
      isActive: false,
      editorUserId: "owner_1",
    });

    const sources = await listWorkspaceSources(repository, context);
    expect(sources.map((source) => source.displayName)).toEqual(["Alpha", "zeta", "Beta"]);
  });
});
