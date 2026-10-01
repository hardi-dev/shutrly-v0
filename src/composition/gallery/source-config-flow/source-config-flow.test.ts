import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const create = vi.fn();
const rename = vi.fn();
const setActive = vi.fn();
const remove = vi.fn();
const listForWorkspace = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner_1" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../source-config-scope/source-config-scope", () => ({
  withSourceConfigScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ sources: { create, rename, setActive, delete: remove, listForWorkspace } }),
}));

const { addPhotoSource, renamePhotoSource } = await import("./source-config-flow");

describe("source-config-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-SRC-006 creates for the verified workspace and owner", async () => {
    create.mockResolvedValue("CREATED");
    await expect(
      addPhotoSource("ws-1", { provider: "GOOGLE_DRIVE", displayName: "Arsip" }),
    ).resolves.toEqual({ ok: true });
    expect(create).toHaveBeenCalledWith(
      { workspaceId: "ws-1" },
      { provider: "GOOGLE_DRIVE", displayName: "Arsip", editorUserId: "owner_1" },
    );
  });

  it("AC-SRC-015 rejects a malformed source ID", async () => {
    await expect(renamePhotoSource("ws-1", "not-a-uuid", { displayName: "Arsip" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(rename).not.toHaveBeenCalled();
  });

  it("AC-SRC-015 maps a repository miss to notFound", async () => {
    rename.mockResolvedValue("NOT_FOUND");
    await expect(
      renamePhotoSource("ws-1", "00000000-0000-4000-8000-000000000001", { displayName: "Arsip" }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-SRC-014 AC-SRC-016 logs only safe identifiers on failure", async () => {
    rename.mockRejectedValue(new Error("db down: Arsip"));
    const sourceId = "00000000-0000-4000-8000-000000000001";
    await expect(
      renamePhotoSource("ws-1", sourceId, { displayName: "Arsip" }),
    ).rejects.toMatchObject({
      code: "SAVE_FAILED",
    });
    expect(logger.error).toHaveBeenCalledWith("source_config.save_failed", {
      workspaceId: "ws-1",
      sourceId,
      operation: "rename",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Arsip");
  });
});
