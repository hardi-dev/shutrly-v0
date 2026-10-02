import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsScreenProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
  readonly count: number;
  readonly rows: readonly ClientRecord[];
  readonly onAdd?: () => void;
}
