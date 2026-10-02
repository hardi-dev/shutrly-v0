import "server-only";

import { CLIENT_PAGE_SIZE } from "@/features/booking/domain/client-list/client-list";
import { clientSearchSchema } from "@/features/booking/domain/client-search/client-search.schema";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";
import type { ClientListQuery } from "../../schemas/client-list-query/client-list-query.types";
import type { ClientPage } from "../client-results/client-results.types";

export async function listClients(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  query: ClientListQuery,
): Promise<ClientPage> {
  const rows = await repository.listPage(context, {
    status: query.status,
    search: clientSearchSchema.safeParse(query.q).data ?? null,
    afterId: query.afterId,
    limit: CLIENT_PAGE_SIZE + 1,
  });
  return {
    items: rows.slice(0, CLIENT_PAGE_SIZE),
    nextCursor: rows.length > CLIENT_PAGE_SIZE ? (rows.at(CLIENT_PAGE_SIZE - 1)?.id ?? null) : null,
  };
}
