import type { ClientRecord } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientListProps {
  readonly status: ClientStatus;
  readonly count: number;
  readonly rows: readonly ClientRecord[];
  readonly action?: ReactNode;
  readonly emptyState: ReactNode;
  readonly onEdit?: (client: ClientRecord) => void;
  readonly onArchive?: (client: ClientRecord) => void;
  readonly onRestore?: (client: ClientRecord) => void;
  readonly onDelete?: (client: ClientRecord) => void;
}
import type { ReactNode } from "react";
