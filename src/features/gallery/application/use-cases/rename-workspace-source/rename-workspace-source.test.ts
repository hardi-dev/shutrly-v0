import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { renameWorkspaceSource } from "./rename-workspace-source";

describe("renameWorkspaceSource", () => {
  it("AC-SRC-010 trims and records the editor", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: "owner_1",
    });
    const id = repository.rows[0]?.id ?? "";

    expect(
      await renameWorkspaceSource(repository, context, id, "owner_1", { displayName: "  Utama " }),
    ).toEqual({ ok: true });
    expect(repository.rows[0]).toMatchObject({ displayName: "Utama", updatedBy: "owner_1" });
  });

  it("AC-SRC-009 maps a duplicate name to a field error", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const context = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Arsip",
      editorUserId: "owner_1",
    });
    await repository.create(context, {
      provider: "GOOGLE_DRIVE",
      displayName: "Utama",
      editorUserId: "owner_1",
    });
    const id = repository.rows[1]?.id ?? "";

    await expect(
      renameWorkspaceSource(repository, context, id, "owner_1", { displayName: " arsip " }),
    ).resolves.toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { displayName: "NAME_TAKEN" },
    });
  });

  it("AC-SRC-015 throws NOT_FOUND for an unknown source", async () => {
    await expect(
      renameWorkspaceSource(
        new FakeWorkspaceSourceRepository(),
        { workspaceId: asWorkspaceId(crypto.randomUUID()) },
        crypto.randomUUID(),
        "owner_1",
        { displayName: "Utama" },
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
