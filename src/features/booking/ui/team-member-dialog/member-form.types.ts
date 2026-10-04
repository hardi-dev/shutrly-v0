import type { Control } from "react-hook-form";

import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type {
  TeamMemberFields,
  TeamMemberInput,
} from "@/features/booking/application/schemas/team-member-input/team-member-input.types";
import type { MultiSelectOption } from "@/ui/patterns/multi-select/multi-select.types";

import type { useTeamMemberForm } from "./use-team-member-form";

export interface MemberFormProps {
  readonly controller: ReturnType<typeof useTeamMemberForm>;
  readonly onCreateRole: () => void;
}

export interface FieldProps {
  readonly control: Control<TeamMemberInput, unknown, TeamMemberFields>;
  readonly isPending: boolean;
  readonly numberHolder?: NumberHolder;
}

export interface RolesFieldProps extends FieldProps {
  readonly options: readonly MultiSelectOption[];
  readonly onCreateRole: () => void;
}
