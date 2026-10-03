import type { ServiceOptionGroup } from "@/features/booking/application/ports/project-repository/project-repository.port";

import type { ClientPickerProps } from "../client-picker/client-picker.types";
import type { SearchClientsAction } from "../use-client-search/use-client-search.types";
import type {
  CreateProjectCall,
  CreateProjectState,
} from "../use-create-project-form/use-create-project-form.types";

export interface CreateProjectScreenProps {
  readonly workspaceId: string;
  readonly serviceGroups: readonly ServiceOptionGroup[];
  readonly createAction: CreateProjectCall;
  readonly searchClientsAction: SearchClientsAction;
  readonly createClientAction?: NonNullable<ClientPickerProps["createAction"]>;
}

export interface CreateProjectCardProps {
  readonly state: CreateProjectState;
  readonly props: CreateProjectScreenProps;
}
