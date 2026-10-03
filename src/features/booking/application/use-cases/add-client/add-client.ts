import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";
import { clientInputSchema } from "../../schemas/client-input/client-input.schema";
import { numberTaken, validationFailure } from "../client-results/client-results";
import type { ClientWriteResult } from "../client-results/client-results.types";

export async function addClient(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
): Promise<ClientWriteResult> {
  const parsed = clientInputSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues);
  const result = await repository.create(context, { ...parsed.data, editorUserId });
  if (result.status === "NUMBER_TAKEN") return numberTaken(result.holder);
  return {
    ok: true,
    client: { id: result.id, name: parsed.data.name, whatsappNumber: parsed.data.whatsappNumber },
  };
}
