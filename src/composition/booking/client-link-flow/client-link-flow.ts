import "server-only";

import { notFound } from "next/navigation";

import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { projectIdSchema } from "@/features/booking/application/schemas/project-ids/project-ids.schema";
import { rotateClientAccessToken } from "@/features/booking/application/use-cases/rotate-client-access-token/rotate-client-access-token";
import type { RotateTokenResult } from "@/features/booking/application/use-cases/rotate-client-access-token/rotate-client-access-token.types";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withProjectScope } from "../project-scope/project-scope";

/** *Ganti link* on the *Akses klien* card (AC-ACC-009). The new token goes back only to the Owner's page and is never logged (C-103). @param rawWorkspaceId - untrusted workspace id @param rawProjectId - untrusted project id @returns the new token, or PROJECT_CANCELLED */
export async function rotateClientLinkEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
): Promise<RotateTokenResult> {
  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) notFound();
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withProjectScope(({ projects, accessTokens, now }) =>
      rotateClientAccessToken(
        { projects, generateToken: accessTokens, now: now() },
        verified.context,
        account.id,
        parsed.data,
      ),
    );
  } catch (error) {
    if (error instanceof ProjectError && error.code === "NOT_FOUND") notFound();
    if (!(error instanceof DomainError)) {
      logger.error("project.rotate_link_failed", { workspaceId: verified.context.workspaceId });
    }
    throw new ProjectError("SAVE_FAILED");
  }
}
