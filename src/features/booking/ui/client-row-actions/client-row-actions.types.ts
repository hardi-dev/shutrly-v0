import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientRowActionsProps {
  readonly client: ClientRecord;
  readonly status: ClientStatus;
  readonly onEdit: () => void;
  readonly onArchive: () => void;
  readonly onRestore: () => void;
  readonly onDelete: () => void;
}
