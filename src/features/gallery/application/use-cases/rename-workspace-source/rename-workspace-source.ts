import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { normaliseSourceName } from "../../../domain/source-name/source-name";
import { SourceConfigError } from "../../errors/source-config-errors/source-config-errors";
import type { WorkspaceSourceRepositoryPort } from "../../ports/workspace-source-repository/workspace-source-repository.port";
import { sourceNameSchema } from "../../schemas/source-name/source-name.schema";
import type { SourceWriteResult } from "../add-workspace-source/add-workspace-source.types";

export async function renameWorkspaceSource(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
  sourceId: string,
  editorUserId: string,
  input: unknown,
): Promise<SourceWriteResult> {
  const parsed = sourceNameSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.at(0)?.message;
    return {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { displayName: message === "TOO_LONG" ? "TOO_LONG" : "EMPTY" },
    };
  }
  const outcome = await repository.rename(context, {
    id: sourceId,
    displayName: normaliseSourceName(parsed.data.displayName),
    editorUserId,
  });
  if (outcome === "NOT_FOUND") throw new SourceConfigError("NOT_FOUND");
  if (outcome === "NAME_TAKEN") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { displayName: "NAME_TAKEN" } };
  }
  return { ok: true };
}
