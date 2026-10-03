import type { ClientOption } from "@/features/booking/application/ports/project-repository/project-repository.port";

export type SearchClientsAction = (
  workspaceId: string,
  query: unknown,
) => Promise<readonly ClientOption[]>;

export interface UseClientSearchInput {
  readonly workspaceId: string;
  readonly query: string;
  readonly searchAction: SearchClientsAction;
}

export interface ClientSearchState {
  readonly items: readonly ClientOption[];
  readonly isLoading: boolean;
}
