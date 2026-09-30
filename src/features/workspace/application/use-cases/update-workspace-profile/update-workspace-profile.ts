import "server-only";

import type { z } from "zod";

import { normaliseInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";
import { normaliseWorkspaceProfile } from "@/features/workspace/domain/workspace-profile/workspace-profile";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import {
  updateWorkspaceProfileFieldsSchema,
  workspaceFieldErrorKeySchema,
} from "../../schemas/workspace-fields/workspace-fields.schema";
import { updateWorkspaceProfileSchema } from "./update-workspace-profile.schema";
import type {
  UpdateWorkspaceProfileFieldErrors,
  UpdateWorkspaceProfileInput,
  UpdateWorkspaceProfileResult,
} from "./update-workspace-profile.types";

/** Validates and updates only the verified workspace profile row, returning field errors instead of saving invalid or duplicate input (AC-WS-017). @param repository - workspace persistence port @param context - ownership-verified workspace context @param input - untrusted settings fields @returns success, or the failure with field error keys; a missing row throws NOT_FOUND */
export async function updateWorkspaceProfile(
  repository: WorkspaceRepositoryPort,
  context: WorkspaceContext,
  input: UpdateWorkspaceProfileInput,
): Promise<UpdateWorkspaceProfileResult> {
  const parsed = updateWorkspaceProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: fieldErrorsOf(parsed.error) };
  }
  const profile = normaliseWorkspaceProfile(parsed.data);
  const result = await repository.updateProfile(context, {
    name: normaliseWorkspaceName(profile.name),
    brandName: profile.brandName ?? null,
    contactEmail: profile.contactEmail ?? null,
    phone: profile.phone ?? null,
    address: profile.address ?? null,
    invoicePrefix: normaliseInvoicePrefix(parsed.data.invoicePrefix),
  });
  if (result.ok) return result;
  if (result.reason === "DUPLICATE_NAME") {
    return { ok: false, code: "DUPLICATE_NAME", fieldErrors: { name: "name.duplicate" } };
  }
  throw new WorkspaceError(result.reason);
}

function fieldErrorsOf(error: z.ZodError): UpdateWorkspaceProfileFieldErrors {
  const fieldErrors: UpdateWorkspaceProfileFieldErrors = {};
  const fields = updateWorkspaceProfileFieldsSchema.keyof();
  for (const issue of error.issues) {
    const field = fields.safeParse(issue.path[0]);
    const key = workspaceFieldErrorKeySchema.safeParse(issue.message);
    if (field.success && key.success) fieldErrors[field.data] ??= key.data;
  }
  return fieldErrors;
}
