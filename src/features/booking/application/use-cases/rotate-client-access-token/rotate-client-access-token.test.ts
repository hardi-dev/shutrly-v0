import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type {
  LockedProject,
  ProjectRepositoryPort,
  ProjectWriter,
} from "../../ports/project-repository/project-repository.port";
import { rotateClientAccessToken } from "./rotate-client-access-token";
import type { RotateTokenDeps } from "./rotate-client-access-token.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const NOW = new Date("2026-10-07T10:00:00Z");

function setup(status: LockedProject["status"] | null, taken: readonly string[] = []) {
  const rotateToken = vi.fn((token: string) => Promise.resolve(!taken.includes(token)));
  const writer = { rotateToken } as unknown as ProjectWriter;
  const withLockedProject = vi.fn(
    (_c: unknown, _id: string, change: (p: LockedProject, w: ProjectWriter) => unknown) =>
      status === null
        ? Promise.resolve("NOT_FOUND")
        : change({ status, agreedPrice: "0", sessionCount: 1, title: "Wisuda Rina" }, writer),
  );
  let n = 0;
  const generateToken = vi.fn(() => {
    n += 1;
    return `token-${String(n)}`;
  });
  const deps = {
    projects: { withLockedProject } as unknown as ProjectRepositoryPort,
    generateToken,
    now: NOW,
  } satisfies RotateTokenDeps;
  return { deps, rotateToken };
}

describe("rotateClientAccessToken (D-19)", () => {
  it("AC-ACC-009 stores a fresh token with the actor and time", async () => {
    const { deps, rotateToken } = setup("DELIVERED");
    expect(await rotateClientAccessToken(deps, CONTEXT, "owner-1", "p")).toEqual({
      ok: true,
      token: "token-1",
    });
    expect(rotateToken).toHaveBeenCalledWith("token-1", "owner-1", NOW);
  });

  it("R-3 retries when a token is already taken", async () => {
    const { deps } = setup("BOOKED", ["token-1"]);
    expect(await rotateClientAccessToken(deps, CONTEXT, "o", "p")).toEqual({
      ok: true,
      token: "token-2",
    });
  });

  it("R-3 gives up after repeated collisions", async () => {
    const { deps } = setup("BOOKED", ["token-1", "token-2", "token-3"]);
    await expect(rotateClientAccessToken(deps, CONTEXT, "o", "p")).rejects.toThrow(ProjectError);
  });

  it("D-19 a cancelled project keeps its dead link", async () => {
    const { deps, rotateToken } = setup("CANCELLED");
    expect(await rotateClientAccessToken(deps, CONTEXT, "o", "p")).toEqual({
      ok: false,
      code: "PROJECT_CANCELLED",
    });
    expect(rotateToken).not.toHaveBeenCalled();
  });

  it("C-101 another workspace's project is not found", async () => {
    await expect(rotateClientAccessToken(setup(null).deps, CONTEXT, "o", "p")).rejects.toThrow(
      ProjectError,
    );
  });
});
