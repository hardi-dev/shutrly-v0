import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

import type { DeleteTeamRoleDialogProps } from "../delete-team-role-dialog/delete-team-role-dialog.types";
import type { TeamRoleDialogProps } from "../team-role-dialog/team-role-dialog.types";

export interface TeamRolesScreenProps {
  readonly workspaceId: string;
  readonly roles: readonly TeamRoleRecord[];
  readonly addAction: TeamRoleDialogProps["addAction"];
  readonly renameAction: TeamRoleDialogProps["renameAction"];
  readonly deleteAction: DeleteTeamRoleDialogProps["action"];
}

export type RolesDialog =
  | { readonly kind: "add" }
  | { readonly kind: "edit"; readonly role: TeamRoleRecord }
  | { readonly kind: "delete"; readonly role: TeamRoleRecord };

export interface RolesDialogsProps {
  readonly dialog: RolesDialog | null;
  readonly onOpenChange: (isOpen: boolean) => void;
}
