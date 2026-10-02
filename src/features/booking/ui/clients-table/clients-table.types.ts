import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsTableProps {
  readonly status: ClientStatus;
  readonly count: number;
  readonly rows: readonly ClientRecord[];
  readonly emptyState: ReactNode;
  readonly search?: ReactNode;
  readonly onRowAction?: (client: ClientRecord) => void;
  readonly onArchive?: (client: ClientRecord) => void;
  readonly onRestore?: (client: ClientRecord) => void;
  readonly onDelete?: (client: ClientRecord) => void;
}
import type { ReactNode } from "react";
