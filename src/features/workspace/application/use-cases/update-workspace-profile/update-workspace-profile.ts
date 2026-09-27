import "server-only";

import { normaliseInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";
import { normaliseWorkspaceProfile } from "@/features/workspace/domain/workspace-profile/workspace-profile";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import { updateWorkspaceProfileSchema } from "./update-workspace-profile.schema";
import type { UpdateWorkspaceProfileInput } from "./update-workspace-profile.types";

/** Validates and updates only the verified workspace profile row. @param repository - workspace persistence port @param context - ownership-verified workspace context @param input - untrusted settings fields @returns success or throws a typed workspace error */
export async function updateWorkspaceProfile(
  repository: WorkspaceRepositoryPort,
  context: WorkspaceContext,
  input: UpdateWorkspaceProfileInput,
) {
  const parsed = updateWorkspaceProfileSchema.safeParse(input);
  if (!parsed.success) throw new WorkspaceError("VALIDATION_FAILED");
  const profile = normaliseWorkspaceProfile(parsed.data);
  const result = await repository.updateProfile(context, {
    name: normaliseWorkspaceName(profile.name),
    brandName: profile.brandName ?? null,
    contactEmail: profile.contactEmail ?? null,
    phone: profile.phone ?? null,
    address: profile.address ?? null,
    invoicePrefix: normaliseInvoicePrefix(parsed.data.invoicePrefix),
  });
  if (!result.ok) throw new WorkspaceError(result.reason);
  return result;
}
