import type { ClientRepositoryPort } from "@/features/booking/application/ports/client-repository/client-repository.port";

export interface ClientScope {
  readonly clients: ClientRepositoryPort;
}
