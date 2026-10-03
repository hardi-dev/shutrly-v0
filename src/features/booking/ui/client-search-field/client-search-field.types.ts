import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientSearchFieldProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
  readonly q: string;
  readonly resultCount: number;
}
