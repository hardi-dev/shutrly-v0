import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const createProjectEntry = vi.fn();
const searchClientsEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/project-flow/project-flow", () => ({
  createProjectEntry,
  searchClientsEntry,
}));

const { createProjectAction, searchActiveClientsAction } = await import("./projects");

describe("project actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-PRJ-008 revalidates the projects layout only after a successful create", async () => {
    createProjectEntry.mockResolvedValue({ ok: true, projectId: "p-1" });
    await expect(createProjectAction("ws-1", {})).resolves.toEqual({ ok: true, projectId: "p-1" });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-PRJ-010 returns a validation failure without revalidating", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: { title: "EMPTY" } };
    createProjectEntry.mockResolvedValue(failure);
    await expect(createProjectAction("ws-1", {})).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-PRJ-006 searches clients through the flow", async () => {
    searchClientsEntry.mockResolvedValue([{ id: "c-1" }]);
    await expect(searchActiveClientsAction("ws-1", "Rin")).resolves.toEqual([{ id: "c-1" }]);
    expect(searchClientsEntry).toHaveBeenCalledWith("ws-1", "Rin");
  });
});
