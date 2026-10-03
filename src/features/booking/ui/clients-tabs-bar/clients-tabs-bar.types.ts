import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsTabsBarProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
}
