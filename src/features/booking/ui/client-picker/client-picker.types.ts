import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";

import type { SearchClientsAction } from "../use-client-search/use-client-search.types";

export interface ClientPickerProps {
  readonly workspaceId: string;
  readonly selectedClient: ClientOption | null;
  readonly onSelect: (client: ClientOption) => void;
  readonly searchAction: SearchClientsAction;
  readonly errorMessage?: string;
}
