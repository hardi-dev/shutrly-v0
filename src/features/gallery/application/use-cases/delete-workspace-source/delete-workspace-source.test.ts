import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { deleteWorkspaceSource } from "./delete-workspace-source";

describe("deleteWorkspaceSource", () => {
  it("AC-SRC-012 deletes an unused source", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: "owner_1",
    });
    const id = repository.rows[0]?.id ?? "";

    await expect(deleteWorkspaceSource(repository, context, id)).resolves.toEqual({ ok: true });
    expect(repository.rows).toHaveLength(0);
  });

  it("AC-SRC-013 maps an in-use source and keeps the row", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: "owner_1",
    });
    const id = repository.rows[0]?.id ?? "";
    repository.inUse.add(id);

    await expect(deleteWorkspaceSource(repository, context, id)).resolves.toEqual({
      ok: false,
      code: "IN_USE",
    });
    expect(repository.rows).toHaveLength(1);
  });

  it("AC-SRC-015 throws NOT_FOUND for an unknown source", async () => {
    await expect(
      deleteWorkspaceSource(
        new FakeWorkspaceSourceRepository(),
        { workspaceId: asWorkspaceId(crypto.randomUUID()) },
        crypto.randomUUID(),
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
