import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { setWorkspaceSourceActive } from "./set-workspace-source-active";

describe("setWorkspaceSourceActive", () => {
  it("AC-SRC-011 deactivates and reactivates a source", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: "owner_1",
    });
    const id = repository.rows[0]?.id ?? "";

    await expect(
      setWorkspaceSourceActive(repository, context, id, "owner_1", false),
    ).resolves.toEqual({ ok: true });
    expect(repository.rows[0]?.isActive).toBe(false);
    await expect(
      setWorkspaceSourceActive(repository, context, id, "owner_1", true),
    ).resolves.toEqual({ ok: true });
    expect(repository.rows[0]?.isActive).toBe(true);
  });

  it("AC-SRC-015 throws NOT_FOUND for an unknown source", async () => {
    await expect(
      setWorkspaceSourceActive(
        new FakeWorkspaceSourceRepository(),
        { workspaceId: asWorkspaceId(crypto.randomUUID()) },
        crypto.randomUUID(),
        "owner_1",
        false,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
