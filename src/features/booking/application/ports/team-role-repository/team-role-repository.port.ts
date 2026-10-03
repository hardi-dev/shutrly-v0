import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface RoleRef {
  readonly id: string;
  readonly name: string;
}

export interface TeamRoleRecord {
  readonly id: string;
  readonly name: string;
  /** Distinct members who hold the role or have an assignment in it (D-10). */
  readonly usage: number;
}

export interface CreatedTeamRole {
  readonly status: "CREATED";
  readonly id: string;
}

export interface RoleNameTaken {
  readonly status: "DUPLICATE";
}

export interface RoleInUse {
  readonly status: "IN_USE";
  readonly usage: number;
}

export interface TeamRoleRepositoryPort {
  /** The workspace's roles with their usage, ordered by lower-cased name. */
  readonly list: (context: WorkspaceContext) => Promise<readonly TeamRoleRecord[]>;
  readonly create: (
    context: WorkspaceContext,
    name: string,
    actorId: string,
  ) => Promise<CreatedTeamRole | RoleNameTaken>;
  readonly rename: (
    context: WorkspaceContext,
    id: string,
    name: string,
    actorId: string,
  ) => Promise<"UPDATED" | "NOT_FOUND" | RoleNameTaken>;
  /** D-10: locks the role, counts its usage and deletes it only while it is unused. */
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "NOT_FOUND" | RoleInUse>;
  /** Inserts the named roles a workspace lacks, ignoring case; idempotent (BR-TEAM-005). */
  readonly seedDefaults: (context: WorkspaceContext, names: readonly string[]) => Promise<void>;
}
