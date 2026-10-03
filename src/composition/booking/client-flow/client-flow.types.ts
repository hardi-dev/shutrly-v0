import type { ClientPage } from "@/features/booking/application/use-cases/client-results/client-results.types";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export interface ClientsData {
  readonly status: ClientStatus;
  readonly q: string;
  readonly page: ClientPage;
  readonly count: number;
}
