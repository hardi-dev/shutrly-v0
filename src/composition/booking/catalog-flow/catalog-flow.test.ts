import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const create = vi.fn();
const updateInfo = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/composition/locale/request-formatting-locale/request-formatting-locale", () => ({
  getRequestFormattingLocale: vi.fn(() => Promise.resolve("id-ID")),
}));
vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner_1" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../catalog-scope/catalog-scope", () => ({
  withCatalogScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({
      categories: {},
      itemDefinitions: {},
      services: { create, updateInfo },
    }),
}));

const { addCatalogService, updateCatalogServiceInfo } = await import("./catalog-flow");

describe("catalog-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-CAT-010 creates a service for the verified workspace and owner", async () => {
    create.mockResolvedValue({ status: "CREATED", id: "00000000-0000-4000-8000-000000000002" });
    const categoryId = "00000000-0000-4000-8000-000000000001";

    await expect(
      addCatalogService("ws-1", { name: "Wisuda Basic", categoryId, basePrice: "750.000" }),
    ).resolves.toEqual({ ok: true, serviceId: "00000000-0000-4000-8000-000000000002" });
    expect(create).toHaveBeenCalledWith(
      { workspaceId: "ws-1" },
      { name: "Wisuda Basic", categoryId, basePrice: "750000", editorUserId: "owner_1" },
    );
  });

  it("AC-CAT-015 rejects malformed service IDs", async () => {
    await expect(
      updateCatalogServiceInfo("ws-1", "not-a-uuid", {
        name: "Arsip",
        categoryId: "00000000-0000-4000-8000-000000000001",
        basePrice: "1",
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(updateInfo).not.toHaveBeenCalled();
  });

  it("AC-CAT-015 maps a repository miss to notFound", async () => {
    updateInfo.mockResolvedValue("NOT_FOUND");
    await expect(
      updateCatalogServiceInfo("ws-1", "00000000-0000-4000-8000-000000000002", {
        name: "Arsip",
        categoryId: "00000000-0000-4000-8000-000000000001",
        basePrice: "1",
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-CAT-014 AC-CAT-016 logs only safe identifiers on failure", async () => {
    updateInfo.mockRejectedValue(new Error("db down: Rahasia"));
    const serviceId = "00000000-0000-4000-8000-000000000002";
    await expect(
      updateCatalogServiceInfo("ws-1", serviceId, {
        name: "Rahasia",
        categoryId: "00000000-0000-4000-8000-000000000001",
        basePrice: "1",
      }),
    ).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).toHaveBeenCalledWith("catalog.save_failed", {
      workspaceId: "ws-1",
      entity: "service",
      entityId: serviceId,
      operation: "update_info",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Rahasia");
  });
});
