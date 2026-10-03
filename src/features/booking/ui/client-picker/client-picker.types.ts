import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";

import type { SearchClientsAction } from "../use-client-search/use-client-search.types";

export interface ClientPickerProps {
  readonly workspaceId: string;
  readonly selectedClient: ClientOption | null;
  readonly onSelect: (client: ClientOption) => void;
  readonly searchAction: SearchClientsAction;
  readonly errorMessage?: string;
  /** Creates a client from the picker (F-06 add action); omit to hide the create row. */
  readonly createAction?: (
    workspaceId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
}
