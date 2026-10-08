import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { RotateTokenDeps, RotateTokenResult } from "./rotate-client-access-token.types";

// R-3: a 256-bit token never collides in practice; a few tries keep the unique index honest.
const MAX_TRIES = 3;

/**
 * *Ganti link*: under the project lock, refuses a cancelled project, stores a fresh CSPRNG token
 * (retrying on a unique collision) with who and when, and returns it. The old link and every
 * client session tied to it stop working; the gallery password is unchanged (BR-PRJ-003,
 * BR-AUD-001, A-16, D-19, AC-ACC-009).
 * @param deps - project repository, the token generator and the clock
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @returns the new token, or PROJECT_CANCELLED
 * @throws ProjectError NOT_FOUND for a project outside the workspace; SAVE_FAILED after repeated collisions
 */
export async function rotateClientAccessToken(
  deps: RotateTokenDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
): Promise<RotateTokenResult> {
  const result = await deps.projects.withLockedProject<RotateTokenResult>(
    context,
    projectId,
    async (project, writer) => {
      if (project.status === "CANCELLED") return { ok: false, code: "PROJECT_CANCELLED" };
      for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
        const token = deps.generateToken();
        if (await writer.rotateToken(token, actorId, deps.now)) return { ok: true, token };
      }
      throw new ProjectError("SAVE_FAILED");
    },
  );
  if (result === "NOT_FOUND") throw new ProjectError("NOT_FOUND");
  return result;
}
