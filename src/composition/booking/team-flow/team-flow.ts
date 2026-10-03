import "server-only";

import { notFound } from "next/navigation";

import { TeamError } from "@/features/booking/application/errors/team-errors/team-errors";
import { teamRoleIdSchema } from "@/features/booking/application/schemas/team-ids/team-ids.schema";
import { addTeamRole } from "@/features/booking/application/use-cases/add-team-role/add-team-role";
import { deleteTeamRole } from "@/features/booking/application/use-cases/delete-team-role/delete-team-role";
import { listTeamRoles } from "@/features/booking/application/use-cases/list-team-roles/list-team-roles";
import { renameTeamRole } from "@/features/booking/application/use-cases/rename-team-role/rename-team-role";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withTeamScope } from "../team-scope/team-scope";

function saveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof TeamError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError)) logger.error("team.save_failed", { workspaceId, operation });
  throw new TeamError("SAVE_FAILED");
}

function idOrNotFound(rawId: string): string {
  const parsed = teamRoleIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

/**
 * Loads the workspace's roles with their usage for the *Peran* tab.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @returns the roles by name
 */
export async function loadTeamRoles(rawWorkspaceId: string) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ roles }) => listTeamRoles(roles, verified.context));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list-roles");
  }
}

/**
 * Adds a role to the workspace.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param values - the untrusted `{ name }`
 * @returns the created role or the field error
 */
export async function addWorkspaceTeamRole(rawWorkspaceId: string, values: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ roles }) =>
      addTeamRole(roles, verified.context, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "add-role");
  }
}

/**
 * Renames a workspace role.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawRoleId - the untrusted role ID
 * @param values - the untrusted `{ name }`
 * @returns success or the field error
 */
export async function renameWorkspaceTeamRole(
  rawWorkspaceId: string,
  rawRoleId: string,
  values: unknown,
) {
  const roleId = idOrNotFound(rawRoleId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ roles }) =>
      renameTeamRole(roles, verified.context, roleId, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "rename-role");
  }
}

/**
 * Deletes a workspace role that nothing uses.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawRoleId - the untrusted role ID
 * @returns success, or `IN_USE` with the usage count
 */
export async function deleteWorkspaceTeamRole(rawWorkspaceId: string, rawRoleId: string) {
  const roleId = idOrNotFound(rawRoleId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ roles }) => deleteTeamRole(roles, verified.context, roleId));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "delete-role");
  }
}
