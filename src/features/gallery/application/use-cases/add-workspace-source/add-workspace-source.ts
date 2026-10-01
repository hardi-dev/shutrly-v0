import "server-only";

import { normaliseSourceName } from "@/features/gallery/domain/source-name/source-name";
import { emptyProviderConfig } from "@/features/gallery/domain/source-provider/source-provider";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceSourceRepositoryPort } from "../../ports/workspace-source-repository/workspace-source-repository.port";
import { addSourceSchema } from "../../schemas/add-source/add-source.schema";
import type {
  SourceFieldErrorKey,
  SourceValidationFailure,
  SourceWriteResult,
} from "./add-workspace-source.types";

const FIELD_ERRORS: readonly SourceFieldErrorKey[] = [
  "EMPTY",
  "TOO_LONG",
  "NAME_TAKEN",
  "PROVIDER_UNAVAILABLE",
];

function isFieldError(value: string): value is SourceFieldErrorKey {
  return FIELD_ERRORS.some((error) => error === value);
}

function failureForIssue(issue: {
  readonly path: PropertyKey[];
  readonly message: string;
}): SourceValidationFailure {
  let message: SourceFieldErrorKey;
  if (isFieldError(issue.message)) {
    message = issue.message;
  } else if (issue.path.at(0) === "provider") {
    message = "PROVIDER_UNAVAILABLE";
  } else {
    message = "EMPTY";
  }
  if (issue.path.at(0) === "provider") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { provider: message } };
  }
  return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { displayName: message } };
}

export async function addWorkspaceSource(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
): Promise<SourceWriteResult> {
  const parsed = addSourceSchema.safeParse(input);
  if (!parsed.success)
    return failureForIssue(parsed.error.issues[0] ?? { path: ["displayName"], message: "EMPTY" });
  const outcome = await repository.create(context, {
    provider: parsed.data.provider,
    displayName: normaliseSourceName(parsed.data.displayName),
    editorUserId,
  });
  if (outcome === "NAME_TAKEN") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { displayName: "NAME_TAKEN" } };
  }
  emptyProviderConfig(parsed.data.provider);
  return { ok: true };
}
