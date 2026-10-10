import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import { completeProject } from "./complete-project";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };

function repo(_status: string, completed: "MOVED" | "STALE" | "NOT_FOUND" = "MOVED") {
  const markCompleted = vi.fn(() => Promise.resolve(completed));
  return { projects: { markCompleted } as unknown as ProjectRepositoryPort, markCompleted };
}

describe("completeProject (BR-PRJ-005, AC-DEL-007)", () => {
  const NOW = new Date("2026-10-12T03:00:00Z");

  it("AC-DEL-007 completes a delivered project with actor and time", async () => {
    const { projects, markCompleted } = repo("DELIVERED");
    expect(await completeProject(projects, CONTEXT, "o", "p", NOW)).toBeUndefined();
    expect(markCompleted).toHaveBeenCalledWith(CONTEXT, "p", "o", NOW);
  });

  it("AC-DEL-007 refuses any other status", async () => {
    const { projects } = repo("POST_PROCESSING", "STALE");
    expect(await completeProject(projects, CONTEXT, "o", "p", NOW)).toEqual({
      ok: false,
      code: "PROJECT_STATUS",
    });
  });
});
