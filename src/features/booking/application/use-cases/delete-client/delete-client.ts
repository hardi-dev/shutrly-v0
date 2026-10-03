import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ClientError } from "../../errors/client-errors/client-errors";
import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";
import type { DeleteClientResult } from "./delete-client.types";

/** Deletes a client unless it is still referenced by a project. */
export async function deleteClient(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  id: string,
): Promise<DeleteClientResult> {
  const result = await repository.delete(context, id);
  if (result === "NOT_FOUND") throw new ClientError("NOT_FOUND");
  return result === "IN_USE" ? { ok: false, code: "IN_USE" } : { ok: true };
}
