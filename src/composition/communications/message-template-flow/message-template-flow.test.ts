import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const updateContent = vi.fn();
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
vi.mock("../message-template-scope/message-template-scope", () => ({
  withMessageTemplateScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ templates: { updateContent }, workspaces: {} }),
}));

const { saveMessageTemplate } = await import("./message-template-flow");

describe("saveMessageTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-MSG-007 saves for the verified workspace and records the owner as editor", async () => {
    updateContent.mockResolvedValue(true);
    await expect(
      saveMessageTemplate("ws-1", "gallery-share", { content: "Halo {{galleryUrl}}" }),
    ).resolves.toEqual({ ok: true });
    expect(updateContent).toHaveBeenCalledWith(
      { workspaceId: "ws-1" },
      { type: "GALLERY_SHARE", content: "Halo {{galleryUrl}}", editorUserId: "owner_1" },
    );
  });

  it("AC-MSG-015 an unknown slug is not found", async () => {
    await expect(saveMessageTemplate("ws-1", "nope", { content: "x" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(updateContent).not.toHaveBeenCalled();
  });

  it("AC-MSG-012 AC-MSG-019 logs only the type and throws a generic failure", async () => {
    updateContent.mockRejectedValue(new Error("db failed for Halo {{galleryUrl}}"));
    await expect(
      saveMessageTemplate("ws-1", "gallery-share", { content: "Halo {{galleryUrl}}" }),
    ).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).toHaveBeenCalledWith("message_template.save_failed", {
      type: "GALLERY_SHARE",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Halo");
  });
});
