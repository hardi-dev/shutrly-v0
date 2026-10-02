import type { ClientWriteResult } from "@/features/booking/application/use-cases/client-results/client-results.types";

export type ClientMutationCall = () => Promise<ClientWriteResult | undefined>;

export interface ClientMutationSuccess {
  readonly title: string;
  readonly body?: string;
}
