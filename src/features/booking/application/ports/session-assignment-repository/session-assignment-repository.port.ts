import "server-only";

import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface AssignmentChange {
  readonly projectId: string;
  readonly sessionId: string;
  readonly memberId: string;
  readonly roleId: string;
  readonly actorId: string;
  /** BR-TEAM-006: the domain predicate, so the repository holds no policy. */
  readonly isEditable: (status: ProjectStatus) => boolean;
}

export type AddAssignmentResult =
  | "ADDED"
  | "NOT_FOUND"
  | "PROJECT_CANCELLED"
  | "MEMBER_ARCHIVED"
  | "ROLE_NOT_HELD"
  | "ALREADY_ASSIGNED";

/** Every call is scoped by the verified workspace (C-101). */
export interface SessionAssignmentRepositoryPort {
  /** D-4: locks the project row, then checks the session, member and role before inserting. */
  readonly add: (
    context: WorkspaceContext,
    change: AssignmentChange,
  ) => Promise<AddAssignmentResult>;
}
