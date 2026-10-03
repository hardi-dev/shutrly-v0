import "server-only";

import type { ClientSearch } from "@/features/booking/domain/client-search/client-search.types";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { TeamMemberFields } from "../../schemas/team-member-input/team-member-input.types";
import type { ArchiveChange, NumberHolder } from "../client-repository/client-repository.port";
import type { RoleRef } from "../team-role-repository/team-role-repository.port";

export interface TeamMemberRecord {
  readonly id: string;
  readonly name: string;
  readonly whatsappNumber: string;
  readonly email: string | null;
  /** Ordered by lower-cased name (TD-A-1). */
  readonly roles: readonly RoleRef[];
  readonly isArchived: boolean;
}

export interface TeamMemberPageQuery {
  readonly status: TeamMemberStatus;
  readonly search: ClientSearch | null;
  /** Keyset cursor: the last row already shown; null for the first page (D-7). */
  readonly afterId: string | null;
  readonly limit: number;
}

export interface TeamMemberChange extends TeamMemberFields {
  readonly editorUserId: string;
}

export interface MemberNumberTaken {
  readonly status: "NUMBER_TAKEN";
  readonly holder: NumberHolder;
}

export interface CreatedTeamMember {
  readonly status: "CREATED";
  readonly id: string;
}

/** Every call is scoped by the verified workspace (C-101). */
export interface TeamMemberRepositoryPort {
  readonly listPage: (
    context: WorkspaceContext,
    query: TeamMemberPageQuery,
  ) => Promise<readonly TeamMemberRecord[]>;
  readonly count: (context: WorkspaceContext, status: TeamMemberStatus) => Promise<number>;
  /** D-9: saves the member and its roles in one transaction; NOT_FOUND when a role is not in the workspace (TD-A-5). */
  readonly create: (
    context: WorkspaceContext,
    change: TeamMemberChange,
  ) => Promise<CreatedTeamMember | MemberNumberTaken | "NOT_FOUND">;
  /** D-9: locks the member, then replaces its fields and roles; assignments keep their role (AC-TEAM-007). */
  readonly update: (
    context: WorkspaceContext,
    id: string,
    change: TeamMemberChange,
  ) => Promise<"UPDATED" | "NOT_FOUND" | MemberNumberTaken>;
  /** Sets or clears `archived_at`; false when the member is not in the workspace (BR-TEAM-004). */
  readonly setArchived: (context: WorkspaceContext, change: ArchiveChange) => Promise<boolean>;
  /** D-11: locks the member and deletes it only while it has no assignment. */
  readonly delete: (
    context: WorkspaceContext,
    id: string,
  ) => Promise<"DELETED" | "HAS_ASSIGNMENTS" | "NOT_FOUND">;
}
