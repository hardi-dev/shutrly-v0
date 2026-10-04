import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const addSessionAssignmentEntry = vi.fn();
const removeSessionAssignmentEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/team-flow/team-flow", () => ({
  addSessionAssignmentEntry,
  removeSessionAssignmentEntry,
}));

const { addSessionAssignmentAction, removeSessionAssignmentAction } =
  await import("./session-team");

describe("session team actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-TEAM-011 revalidates the projects layout after an assignment is added", async () => {
    addSessionAssignmentEntry.mockResolvedValue({ ok: true });
    await expect(addSessionAssignmentAction("ws", "p", "s", {})).resolves.toEqual({ ok: true });
    expect(addSessionAssignmentEntry).toHaveBeenCalledWith("ws", "p", "s", {});
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-TEAM-013 returns a form failure without revalidating", async () => {
    const failure = { ok: false, code: "ALREADY_ASSIGNED" };
    addSessionAssignmentEntry.mockResolvedValue(failure);
    await expect(addSessionAssignmentAction("ws", "p", "s", {})).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-TEAM-015 refreshes the page when the project turned out to be cancelled", async () => {
    addSessionAssignmentEntry.mockResolvedValue({ ok: false, code: "PROJECT_CANCELLED" });
    await addSessionAssignmentAction("ws", "p", "s", {});
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-TEAM-014 revalidates the projects layout after an assignment is removed", async () => {
    removeSessionAssignmentEntry.mockResolvedValue({ ok: true });
    await expect(removeSessionAssignmentAction("ws", "p", "a")).resolves.toEqual({ ok: true });
    expect(removeSessionAssignmentEntry).toHaveBeenCalledWith("ws", "p", "a");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-TEAM-015 refreshes the page when the removal finds the project cancelled", async () => {
    removeSessionAssignmentEntry.mockResolvedValue({ ok: false, code: "PROJECT_CANCELLED" });
    await removeSessionAssignmentAction("ws", "p", "a");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });
});
