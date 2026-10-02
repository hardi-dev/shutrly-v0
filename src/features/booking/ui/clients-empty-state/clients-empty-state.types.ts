import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsEmptyStateProps {
  readonly status: ClientStatus;
  readonly action?: ReactNode;
}
import type { ReactNode } from "react";
