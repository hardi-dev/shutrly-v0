import "server-only";

import { notFound } from "next/navigation";

import { TeamError } from "@/features/booking/application/errors/team-errors/team-errors";
import {
  assignmentIdSchema,
  projectIdSchema,
  sessionIdSchema,
  teamMemberIdSchema,
  teamRoleIdSchema,
} from "@/features/booking/application/schemas/team-ids/team-ids.schema";
import { teamMemberListQuerySchema } from "@/features/booking/application/schemas/team-member-list-query/team-member-list-query.schema";
import { addSessionAssignment } from "@/features/booking/application/use-cases/add-session-assignment/add-session-assignment";
import { addTeamMember } from "@/features/booking/application/use-cases/add-team-member/add-team-member";
import { addTeamRole } from "@/features/booking/application/use-cases/add-team-role/add-team-role";
import { countTeamMembers } from "@/features/booking/application/use-cases/count-team-members/count-team-members";
import { deleteTeamMember } from "@/features/booking/application/use-cases/delete-team-member/delete-team-member";
import { deleteTeamRole } from "@/features/booking/application/use-cases/delete-team-role/delete-team-role";
import { listAssignableMembers } from "@/features/booking/application/use-cases/list-assignable-members/list-assignable-members";
import { listTeamMembers } from "@/features/booking/application/use-cases/list-team-members/list-team-members";
import { listTeamRoles } from "@/features/booking/application/use-cases/list-team-roles/list-team-roles";
import { removeSessionAssignment } from "@/features/booking/application/use-cases/remove-session-assignment/remove-session-assignment";
import { renameTeamRole } from "@/features/booking/application/use-cases/rename-team-role/rename-team-role";
import { setTeamMemberArchived } from "@/features/booking/application/use-cases/set-team-member-archived/set-team-member-archived";
import { updateTeamMember } from "@/features/booking/application/use-cases/update-team-member/update-team-member";
import { clientSearchSchema } from "@/features/booking/domain/client-search/client-search.schema";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withTeamScope } from "../team-scope/team-scope";
import type { TeamMembersData } from "./team-flow.types";

function saveError(
  error: unknown,
  workspaceId: string,
  operation: string,
  projectId?: string,
): never {
  if (error instanceof TeamError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError)) {
    logger.error("team.save_failed", { workspaceId, operation, ...(projectId && { projectId }) });
  }
  throw new TeamError("SAVE_FAILED");
}

function idOrNotFound(rawId: string): string {
  const parsed = teamRoleIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

function memberIdOrNotFound(rawId: string): string {
  const parsed = teamMemberIdSchema.safeParse(rawId);
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

/**
 * Loads the first page of a member tab with its count and the workspace roles for the member form.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param status - the tab: active or archived
 * @param rawQ - the untrusted `?q=` search text
 * @returns the page, the tab count, the accepted search text and the roles
 */
export async function loadTeamMembers(
  rawWorkspaceId: string,
  status: TeamMemberStatus,
  rawQ = "",
): Promise<TeamMembersData> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const q = clientSearchSchema.safeParse(rawQ).success ? rawQ : "";
  try {
    return await withTeamScope(async ({ members, roles }) => ({
      status,
      q,
      page: await listTeamMembers(members, verified.context, { status, q, afterId: null }),
      count: await countTeamMembers(members, verified.context, status),
      roles: await listTeamRoles(roles, verified.context),
    }));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list-members");
  }
}

/**
 * Loads the next page of a member tab.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawQuery - the untrusted `{ status, q, afterId }`
 * @returns the next page and its cursor
 */
export async function loadMoreTeamMembers(rawWorkspaceId: string, rawQuery: unknown) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const parsed = teamMemberListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) notFound();
  try {
    return await withTeamScope(({ members }) =>
      listTeamMembers(members, verified.context, parsed.data),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list-members");
  }
}

/**
 * Adds a member with its roles.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param values - the untrusted member form values
 * @returns the created member or the field errors
 */
export async function addWorkspaceTeamMember(rawWorkspaceId: string, values: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ members }) =>
      addTeamMember(members, verified.context, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "add-member");
  }
}

/**
 * Saves a member's fields and roles.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawMemberId - the untrusted member ID
 * @param values - the untrusted member form values
 * @returns success or the field errors
 */
export async function updateWorkspaceTeamMember(
  rawWorkspaceId: string,
  rawMemberId: string,
  values: unknown,
) {
  const memberId = memberIdOrNotFound(rawMemberId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ members }) =>
      updateTeamMember(members, verified.context, account.id, memberId, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "update-member");
  }
}

/**
 * Archives or restores a member.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawMemberId - the untrusted member ID
 * @param isArchived - true to archive, false to restore
 * @returns nothing
 */
export async function setWorkspaceTeamMemberArchived(
  rawWorkspaceId: string,
  rawMemberId: string,
  isArchived: boolean,
): Promise<void> {
  const memberId = memberIdOrNotFound(rawMemberId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    await withTeamScope(({ members }) =>
      setTeamMemberArchived(members, verified.context, account.id, memberId, isArchived),
    );
  } catch (error) {
    return saveError(
      error,
      verified.context.workspaceId,
      isArchived ? "archive-member" : "restore-member",
    );
  }
}

/**
 * Deletes a member that has no assignment.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawMemberId - the untrusted member ID
 * @returns success, or `HAS_ASSIGNMENTS`
 */
export async function deleteWorkspaceTeamMember(rawWorkspaceId: string, rawMemberId: string) {
  const memberId = memberIdOrNotFound(rawMemberId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ members }) =>
      deleteTeamMember(members, verified.context, memberId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "delete-member");
  }
}

/**
 * Loads the active members with their roles for the project detail's Penugasan form.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @returns the active members by name
 */
export async function loadAssignableMembers(rawWorkspaceId: string) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ members }) => listAssignableMembers(members, verified.context));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list-assignable");
  }
}

/**
 * Puts a member on a session of a project in one role.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawProjectId - the untrusted project ID
 * @param rawSessionId - the untrusted session ID
 * @param values - the untrusted `{ memberId, roleId }`
 * @returns success, or the failure code for the form
 */
export async function addSessionAssignmentEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  rawSessionId: string,
  values: unknown,
) {
  const projectId = projectIdSchema.safeParse(rawProjectId);
  const sessionId = sessionIdSchema.safeParse(rawSessionId);
  if (!projectId.success || !sessionId.success) notFound();
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const target = { projectId: projectId.data, sessionId: sessionId.data };
  try {
    return await withTeamScope(({ assignments }) =>
      addSessionAssignment(assignments, verified.context, account.id, target, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "add-assignment", target.projectId);
  }
}

/**
 * Takes a member off a session of a project.
 * @param rawWorkspaceId - the untrusted route workspace ID
 * @param rawProjectId - the untrusted project ID
 * @param rawAssignmentId - the untrusted assignment ID
 * @returns success, or `PROJECT_CANCELLED`
 */
export async function removeSessionAssignmentEntry(
  rawWorkspaceId: string,
  rawProjectId: string,
  rawAssignmentId: string,
) {
  const projectId = projectIdSchema.safeParse(rawProjectId);
  const assignmentId = assignmentIdSchema.safeParse(rawAssignmentId);
  if (!projectId.success || !assignmentId.success) notFound();
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withTeamScope(({ assignments }) =>
      removeSessionAssignment(assignments, verified.context, projectId.data, assignmentId.data),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "remove-assignment", projectId.data);
  }
}
