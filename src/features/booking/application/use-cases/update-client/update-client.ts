import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ClientError } from "../../errors/client-errors/client-errors";
import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";
import { clientInputSchema } from "../../schemas/client-input/client-input.schema";
import { numberTaken, validationFailure } from "../client-results/client-results";
import type { ClientWriteResult } from "../client-results/client-results.types";

export async function updateClient(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  input: unknown,
): Promise<ClientWriteResult> {
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);
  const result = await repository.update(context, id, { ...parsed.data, editorUserId });
  if (result === "NOT_FOUND") throw new ClientError("NOT_FOUND");
  return result === "UPDATED" ? { ok: true } : numberTaken(result.holder);
}
