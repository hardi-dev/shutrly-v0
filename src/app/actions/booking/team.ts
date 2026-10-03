"use server";

import { revalidatePath } from "next/cache";

import {
  addWorkspaceTeamRole,
  deleteWorkspaceTeamRole,
  renameWorkspaceTeamRole,
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
