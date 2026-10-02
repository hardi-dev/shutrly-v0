import "server-only";

import { notFound } from "next/navigation";

import { ClientError } from "@/features/booking/application/errors/client-errors/client-errors";
import { clientIdSchema } from "@/features/booking/application/schemas/client-id/client-id.schema";
import { addClient } from "@/features/booking/application/use-cases/add-client/add-client";
import { countClients } from "@/features/booking/application/use-cases/count-clients/count-clients";
import { listClients } from "@/features/booking/application/use-cases/list-clients/list-clients";
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
