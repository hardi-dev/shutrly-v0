import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ClientError } from "../../errors/client-errors/client-errors";
import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";

/** Archives or restores a client within its verified workspace. */
export async function setClientArchived(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  id: string,
  isArchived: boolean,
): Promise<void> {
  const updated = await repository.setArchived(context, { id, isArchived, editorUserId });
  if (!updated) throw new ClientError("NOT_FOUND");
}
