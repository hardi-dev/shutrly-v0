import type { ClientPage } from "@/features/booking/application/use-cases/client-results/client-results.types";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface UseLoadMoreClientsProps {
  readonly workspaceId: string;
  readonly status: ClientStatus;
  readonly q: string;
  readonly initial: ClientPage;
  readonly action?: (workspaceId: string, query: unknown) => Promise<ClientPage>;
}
