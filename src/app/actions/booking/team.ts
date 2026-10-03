"use server";

import { revalidatePath } from "next/cache";

import {
  addWorkspaceTeamMember,
  addWorkspaceTeamRole,
  deleteWorkspaceTeamRole,
  loadMoreTeamMembers,
  renameWorkspaceTeamRole,
  updateWorkspaceTeamMember,
} from "@/composition/booking/team-flow/team-flow";

const PAGE = "/w/[workspaceId]/team";
const PROJECTS = "/w/[workspaceId]/projects";

export async function addTeamRoleAction(workspaceId: string, values: unknown) {
  const result = await addWorkspaceTeamRole(workspaceId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function renameTeamRoleAction(workspaceId: string, roleId: string, values: unknown) {
  const result = await renameWorkspaceTeamRole(workspaceId, roleId, values);
  if (result.ok) {
    revalidatePath(PAGE, "layout");
    // A role's name shows in the project's Jadwal.
    revalidatePath(PROJECTS, "layout");
  }
  return result.ok ? undefined : result;
}

export async function deleteTeamRoleAction(workspaceId: string, roleId: string) {
  const result = await deleteWorkspaceTeamRole(workspaceId, roleId);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function addTeamMemberAction(workspaceId: string, values: unknown) {
  const result = await addWorkspaceTeamMember(workspaceId, values);
  if (result.ok) revalidatePath(PAGE, "layout");
  return result;
}

export async function updateTeamMemberAction(
  workspaceId: string,
  memberId: string,
  values: unknown,
) {
  const result = await updateWorkspaceTeamMember(workspaceId, memberId, values);
  if (result.ok) {
    revalidatePath(PAGE, "layout");
    // A member's name shows in the project's Jadwal.
    revalidatePath(PROJECTS, "layout");
  }
  return result.ok ? undefined : result;
}

export async function loadMoreTeamMembersAction(workspaceId: string, query: unknown) {
  return loadMoreTeamMembers(workspaceId, query);
}
