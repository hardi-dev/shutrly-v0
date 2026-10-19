import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const createProject = vi.fn<(...args: unknown[]) => Promise<unknown>>();
const getProjectDetail = vi.fn();
const withMarkDeliveredScope = vi.fn<(target: unknown) => Promise<unknown>>();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/composition/locale/request-formatting-locale/request-formatting-locale", () => ({
  getRequestFormattingLocale: vi.fn(() => Promise.resolve("id-ID")),
}));
vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/features/booking/application/use-cases/create-project/create-project", () => ({
  createProject,
}));
vi.mock("@/features/booking/application/use-cases/get-project-detail/get-project-detail", () => ({
  getProjectDetail,
}));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../booking-gallery-scope/booking-gallery-scope", () => ({
  createBookedProject: (...args: unknown[]) => createProject(...args),
  confirmBookedProject: vi.fn(),
}));
vi.mock("../../gallery/mark-delivered-scope/mark-delivered-scope", () => ({
  withMarkDeliveredScope: (target: unknown) => withMarkDeliveredScope(target),
}));
vi.mock("../project-scope/project-scope", () => ({
  withProjectScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ projects: {}, accessTokens: () => "token" }),
}));

const { ProjectError } =
  await import("@/features/booking/application/errors/project-errors/project-errors");
const { advanceProjectEntry, createProjectEntry, loadProjectDetail } =
  await import("./project-flow");
const { confirmBookedProject } = await import("../booking-gallery-scope/booking-gallery-scope");

describe("project-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-PRJ-025 maps a malformed project id to notFound", async () => {
    await expect(loadProjectDetail("ws-1", "not-a-uuid")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getProjectDetail).not.toHaveBeenCalled();
  });

  it("AC-PRJ-012 maps NOT_FOUND from a use case to notFound", async () => {
    createProject.mockRejectedValue(new ProjectError("NOT_FOUND"));
    await expect(createProjectEntry("ws-1", {})).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-GFL-002 confirming a draft runs the booking-gallery scope, not the plain step", async () => {
    const projectId = "00000000-0000-4000-8000-0000000000a1";
    await advanceProjectEntry("ws-1", projectId, "CONFIRM_BOOKING");
    expect(confirmBookedProject).toHaveBeenCalledWith({ workspaceId: "ws-1" }, "owner", projectId);
  });

  it("AC-GFL-017 Tandai terkirim runs the mark-delivered scope and returns undefined when it moves", async () => {
    const projectId = "00000000-0000-4000-8000-0000000000a1";
    withMarkDeliveredScope.mockResolvedValue(undefined);
    await expect(advanceProjectEntry("ws-1", projectId, "MARK_DELIVERED")).resolves.toBeUndefined();
    expect(withMarkDeliveredScope).toHaveBeenCalledWith({
      context: { workspaceId: "ws-1" },
      actorId: "owner",
      projectId,
    });
    expect(confirmBookedProject).not.toHaveBeenCalled();
  });

  it("AC-GFL-017 a refusal without a synced finished file is DELIVERY_REFUSED, a moved status is STALE", async () => {
    const projectId = "00000000-0000-4000-8000-0000000000a1";
    withMarkDeliveredScope.mockResolvedValueOnce({
      ok: false,
      code: "REFUSED",
      reasons: ["NO_FINISHED_FILE"],
    });
    await expect(advanceProjectEntry("ws-1", projectId, "MARK_DELIVERED")).resolves.toEqual({
      ok: false,
      code: "DELIVERY_REFUSED",
    });
    withMarkDeliveredScope.mockResolvedValueOnce({
      ok: false,
      code: "REFUSED",
      reasons: ["PROJECT_STATUS"],
    });
    await expect(advanceProjectEntry("ws-1", projectId, "MARK_DELIVERED")).resolves.toEqual({
      ok: false,
      code: "STALE",
    });
  });

  it("C-103 logs only the workspace and operation on an unexpected error", async () => {
    createProject.mockRejectedValue(new Error("Rahasia Rina 0812 database down"));
    await expect(createProjectEntry("ws-1", { title: "Rahasia" })).rejects.toMatchObject({
      code: "SAVE_FAILED",
    });
    expect(logger.error).toHaveBeenCalledWith("project.save_failed", {
      workspaceId: "ws-1",
      operation: "create",
    });
  });

  it("does not log an expected domain error", async () => {
    getProjectDetail.mockRejectedValue(new ProjectError("SAVE_FAILED"));
    await expect(
      loadProjectDetail("ws-1", "00000000-0000-4000-8000-000000000001"),
    ).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).not.toHaveBeenCalled();
  });
});
