import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const addCatalogService = vi.fn();
const addCatalogCategory = vi.fn();
const setCatalogActive = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/catalog-flow/catalog-flow", () => ({
  addCatalogBookingField: vi.fn(),
  addCatalogCategory,
  addCatalogItemDefinition: vi.fn(),
  addCatalogService,
  addCatalogServiceItem: vi.fn(),
  deleteCatalogEntry: vi.fn(),
  moveCatalogBookingField: vi.fn(),
  moveCatalogServiceItem: vi.fn(),
  removeCatalogBookingField: vi.fn(),
  removeCatalogServiceItem: vi.fn(),
  renameCatalogCategory: vi.fn(),
  setCatalogActive,
  updateCatalogBookingField: vi.fn(),
  updateCatalogItemDefinition: vi.fn(),
  updateCatalogServiceInfo: vi.fn(),
  updateCatalogServiceItem: vi.fn(),
}));

const { addServiceAction, addCategoryAction, setCatalogActiveAction } = await import("./catalog");

describe("catalog actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-CAT-010 returns the created service and revalidates the catalog layout", async () => {
    addCatalogService.mockResolvedValue({ ok: true, serviceId: "service-1" });
    await expect(addServiceAction("ws-1", { name: "Wisuda" })).resolves.toEqual({
      ok: true,
      serviceId: "service-1",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/services", "layout");
  });

  it("returns field failures without revalidating", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } };
    addCatalogCategory.mockResolvedValue(failure);
    await expect(addCategoryAction("ws-1", { name: "Wisuda" })).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("revalidates after an active-state mutation", async () => {
    setCatalogActive.mockResolvedValue(undefined);
    await expect(
      setCatalogActiveAction("ws-1", "service", "service-1", false),
    ).resolves.toBeUndefined();
    expect(setCatalogActive).toHaveBeenCalledWith("ws-1", "service", "service-1", false);
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/services", "layout");
  });
});
