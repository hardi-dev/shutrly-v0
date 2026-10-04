import type {
  ActiveDefinition,
  ServiceOptionGroup,
} from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";

import type { ClientPickerProps } from "../client-picker/client-picker.types";
import type { SearchClientsAction } from "../use-client-search/use-client-search.types";
import type { DraftItem } from "../use-create-project-form/package-draft.types";
import type {
  CreateProjectCall,
  CreateProjectState,
} from "../use-create-project-form/use-create-project-form.types";

export interface CreateProjectScreenProps {
  readonly workspaceId: string;
  readonly serviceGroups: readonly ServiceOptionGroup[];
  readonly createAction: CreateProjectCall;
  readonly searchClientsAction: SearchClientsAction;
  readonly hasActiveService: boolean;
  readonly definitions: readonly ActiveDefinition[];
  /** Active members the Owner can pick for each session (AC-TEAM-028). */
  readonly assignableMembers: readonly AssignableMember[];
  readonly createClientAction?: NonNullable<ClientPickerProps["createAction"]>;
}

export interface CreateProjectCardProps {
  readonly state: CreateProjectState;
  readonly props: CreateProjectScreenProps;
}

export type PackageEditOpen =
  | { readonly kind: "add" }
  | { readonly kind: "edit"; readonly item: DraftItem }
  | { readonly kind: "remove"; readonly item: DraftItem }
  | null;
