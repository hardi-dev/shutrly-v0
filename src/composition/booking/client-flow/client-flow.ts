import "server-only";

import { notFound } from "next/navigation";

import { ClientError } from "@/features/booking/application/errors/client-errors/client-errors";
import { clientIdSchema } from "@/features/booking/application/schemas/client-id/client-id.schema";
import { clientListQuerySchema } from "@/features/booking/application/schemas/client-list-query/client-list-query.schema";
import { addClient } from "@/features/booking/application/use-cases/add-client/add-client";
import { countClients } from "@/features/booking/application/use-cases/count-clients/count-clients";
import { deleteClient } from "@/features/booking/application/use-cases/delete-client/delete-client";
import { getClient } from "@/features/booking/application/use-cases/get-client/get-client";
import { listClients } from "@/features/booking/application/use-cases/list-clients/list-clients";
import { setClientArchived } from "@/features/booking/application/use-cases/set-client-archived/set-client-archived";
import { updateClient } from "@/features/booking/application/use-cases/update-client/update-client";
import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";
import { clientSearchSchema } from "@/features/booking/domain/client-search/client-search.schema";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withClientScope } from "../client-scope/client-scope";
import type { ClientsData } from "./client-flow.types";

function saveError(error: unknown, workspaceId: string, operation: string): never {
  if (error instanceof ClientError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError))
    logger.error("client.save_failed", { workspaceId, operation });
  throw new ClientError("SAVE_FAILED");
}

function idOrNotFound(rawId: string): string {
  const parsed = clientIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

export async function loadClients(
  rawWorkspaceId: string,
  status: ClientStatus,
  rawQ = "",
): Promise<ClientsData> {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const q = clientSearchSchema.safeParse(rawQ).success ? rawQ : "";
  try {
    return await withClientScope(async ({ clients }) => ({
      status,
      q,
      page: await listClients(clients, verified.context, { status, q, afterId: null }),
      count: await countClients(clients, verified.context, status),
    }));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list");
  }
}

export async function addWorkspaceClient(rawWorkspaceId: string, values: unknown) {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withClientScope(({ clients }) =>
      addClient(clients, verified.context, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "add");
  }
}

export async function updateWorkspaceClient(
  rawWorkspaceId: string,
  rawClientId: string,
  values: unknown,
) {
  const clientId = idOrNotFound(rawClientId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withClientScope(({ clients }) =>
      updateClient(clients, verified.context, clientId, account.id, values),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "update");
  }
}

export async function setWorkspaceClientArchived(
  rawWorkspaceId: string,
  rawClientId: string,
  isArchived: boolean,
): Promise<void> {
  const clientId = idOrNotFound(rawClientId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    await withClientScope(({ clients }) =>
      setClientArchived(clients, verified.context, account.id, clientId, isArchived),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, isArchived ? "archive" : "restore");
  }
}

export async function deleteWorkspaceClient(rawWorkspaceId: string, rawClientId: string) {
  const clientId = idOrNotFound(rawClientId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withClientScope(({ clients }) =>
      deleteClient(clients, verified.context, clientId),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "delete");
  }
}

export async function loadMoreClients(rawWorkspaceId: string, rawQuery: unknown) {
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const parsed = clientListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) notFound();
  try {
    return await withClientScope(({ clients }) =>
      listClients(clients, verified.context, parsed.data),
    );
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "list");
  }
}

export async function loadClientForEdit(rawWorkspaceId: string, rawClientId: string) {
  const clientId = idOrNotFound(rawClientId);
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  try {
    return await withClientScope(({ clients }) => getClient(clients, verified.context, clientId));
  } catch (error) {
    return saveError(error, verified.context.workspaceId, "get");
  }
}
