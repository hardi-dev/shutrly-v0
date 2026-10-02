import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientInput } from "@/features/booking/application/schemas/client-input/client-input.types";
import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsScreenProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
  readonly count: number;
  readonly rows: readonly ClientRecord[];
  readonly addAction?: (
    workspaceId: string,
    values: ClientInput,
  ) => Promise<ClientWriteResult | undefined>;
}
