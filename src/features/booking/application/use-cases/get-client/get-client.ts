import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ClientError } from "../../errors/client-errors/client-errors";
import type {
  ClientRecord,
  ClientRepositoryPort,
} from "../../ports/client-repository/client-repository.port";

/** Loads one client in the verified workspace for the edit dialog; a missing or foreign client is NOT_FOUND. @param repository - client port @param context - verified workspace @param clientId - the client id @returns the client record */
export async function getClient(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  clientId: string,
): Promise<ClientRecord> {
  const found = await repository.findById(context, clientId);
  if (found === null) throw new ClientError("NOT_FOUND");
  return found;
}
