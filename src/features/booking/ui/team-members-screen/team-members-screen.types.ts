import type { ReactNode } from "react";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { TeamMemberPage } from "@/features/booking/application/use-cases/team-results/team-results.types";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

import type { TeamMemberDialogProps } from "../team-member-dialog/team-member-dialog.types";

export interface TeamMembersScreenProps {
  readonly workspaceId: string;
  readonly status: TeamMemberStatus;
  /** The tab's member count, which ignores the search (D-7). */
  readonly count: number;
  readonly q: string;
  readonly initialPage: TeamMemberPage;
  readonly loadMoreAction: (workspaceId: string, query: unknown) => Promise<TeamMemberPage>;
  /** The workspace's roles, for the member form. */
  readonly roles: readonly RoleRef[];
  readonly addAction: TeamMemberDialogProps["addAction"];
  readonly updateAction: TeamMemberDialogProps["updateAction"];
  readonly addRoleAction: TeamMemberDialogProps["addRoleAction"];
}

export interface LoadMoreButtonProps {
  readonly isLoading: boolean;
  readonly onLoadMore: () => Promise<void>;
}

export interface MembersBodyProps extends TeamMembersScreenProps {
  readonly isMobile: boolean;
  /** The rows loaded so far, which include appended pages. */
  readonly rows: TeamMemberPage["items"];
  readonly addButton: ReactNode;
  readonly onAdd: () => void;
  readonly onEdit: (member: TeamMemberRecord) => void;
}
