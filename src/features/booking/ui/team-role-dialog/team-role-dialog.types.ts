import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type {
  TeamRoleValidationFailure,
  TeamRoleWriteResult,
} from "@/features/booking/application/use-cases/team-results/team-results.types";

export interface TeamRoleDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Edit mode when present, add mode otherwise. */
  readonly role?: TeamRoleRecord;
  /** Called with the new role after a successful add (the member form selects it). */
  readonly onCreated?: (role: { readonly id: string; readonly name: string }) => void;
  readonly addAction: (workspaceId: string, values: unknown) => Promise<TeamRoleWriteResult>;
  readonly renameAction: (
    workspaceId: string,
    roleId: string,
    values: unknown,
  ) => Promise<TeamRoleValidationFailure | undefined>;
}
