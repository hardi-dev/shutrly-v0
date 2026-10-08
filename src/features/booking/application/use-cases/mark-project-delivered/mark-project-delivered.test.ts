import { describe, expect, it, vi } from "vitest";

import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { markProjectDelivered } from "./mark-project-delivered";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };

function repo(status: ProjectStatus | null, completed: "MOVED" | "STALE" | "NOT_FOUND" = "MOVED") {
  const moveStatus = vi.fn(() => Promise.resolve("MOVED"));
  const markCompleted = vi.fn(() => Promise.resolve(completed));
  const projects = {
    lockStatus: vi.fn(() => Promise.resolve(status)),
    moveStatus,
    markCompleted,
  } as unknown as ProjectRepositoryPort;
  return { projects, moveStatus, markCompleted };
}

describe("markProjectDelivered (BR-DEL-003, D-17)", () => {
  it.each(["BOOKED", "SHOOTING", "POST_PROCESSING"] as const)(
    "AC-DEL-001 moves %s to DELIVERED",
    async (status) => {
      const { projects, moveStatus } = repo(status);
      expect(await markProjectDelivered(projects, CONTEXT, "o", "p")).toBeUndefined();
      expect(moveStatus).toHaveBeenCalledWith(CONTEXT, "p", { from: status, to: "DELIVERED" }, "o");
    },
  );

  it.each(["DELIVERED", "COMPLETED", "DRAFT", "CANCELLED"] as const)(
    "AC-DEL-002 refuses a %s project",
    async (status) => {
      const { projects, moveStatus } = repo(status);
      expect(await markProjectDelivered(projects, CONTEXT, "o", "p")).toEqual({
        ok: false,
        code: "PROJECT_STATUS",
      });
      expect(moveStatus).not.toHaveBeenCalled();
    },
  );

  it("C-101 a project outside the workspace is not found", async () => {
    await expect(markProjectDelivered(repo(null).projects, CONTEXT, "o", "p")).rejects.toThrow(
      ProjectError,
    );
  });
});
