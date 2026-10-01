import { FakeWorkspaceSourceRepository } from "@tests/support/gallery/fake-workspace-source-repository";
import { describe, expect, it } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { seedDefaultSource } from "../seed-default-source/seed-default-source";
import { addWorkspaceSource } from "./add-workspace-source";

function context() {
  return { workspaceId: asWorkspaceId(crypto.randomUUID()) };
}

describe("addWorkspaceSource", () => {
  it("AC-SRC-006 stores a trimmed active source with an empty config", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const workspace = context();
    const result = await addWorkspaceSource(repository, workspace, "owner_1", {
      provider: "GOOGLE_DRIVE",
      displayName: "  Google Drive Arsip ",
    });

    expect(result).toEqual({ ok: true });
    expect(repository.rows).toMatchObject([
      {
        workspaceId: workspace.workspaceId,
        provider: "GOOGLE_DRIVE",
        displayName: "Google Drive Arsip",
        isActive: true,
        configData: {},
        updatedBy: "owner_1",
      },
    ]);
  });

  it("AC-SRC-007 returns a provider field error", async () => {
    const result = await addWorkspaceSource(
      new FakeWorkspaceSourceRepository(),
      context(),
      "owner_1",
      { provider: "DROPBOX", displayName: "Arsip" },
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { provider: "PROVIDER_UNAVAILABLE" },
    });
  });

  it("AC-SRC-008 returns an empty-name field error", async () => {
    const result = await addWorkspaceSource(
      new FakeWorkspaceSourceRepository(),
      context(),
      "owner_1",
      { provider: "GOOGLE_DRIVE", displayName: "  " },
    );
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { displayName: "EMPTY" },
    });
  });

  it("AC-SRC-009 rejects a duplicate only in the same workspace", async () => {
    const repository = new FakeWorkspaceSourceRepository();
    const first = context();
    const second = context();
    await seedDefaultSource(repository, first);

    await expect(
      addWorkspaceSource(repository, first, "owner_1", {
        provider: "GOOGLE_DRIVE",
        displayName: "google drive",
      }),
    ).resolves.toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { displayName: "NAME_TAKEN" },
    });
    await expect(
      addWorkspaceSource(repository, second, "owner_2", {
        provider: "GOOGLE_DRIVE",
        displayName: "google drive",
      }),
    ).resolves.toEqual({ ok: true });
  });
});
