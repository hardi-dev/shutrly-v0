import "server-only";

import { suggestInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import { createFirstWorkspaceSchema } from "./create-first-workspace.schema";
import type { CreateFirstWorkspaceInput } from "./create-first-workspace.types";

/** Creates the first IDR workspace only when the owner has none. @param repository - workspace persistence port @param owner - authenticated owner ID @param input - untrusted onboarding fields @returns the created workspace ID @throws WorkspaceError for validation, duplicate or existing-workspace failures */
export async function createFirstWorkspace(
  repository: WorkspaceRepositoryPort,
  owner: OwnerUserId,
  input: CreateFirstWorkspaceInput,
) {
  const parsed = createFirstWorkspaceSchema.safeParse(input);
  if (!parsed.success) throw new WorkspaceError("VALIDATION_FAILED");
  if ((await repository.countForOwner(owner)) > 0)
    throw new WorkspaceError("ALREADY_HAS_WORKSPACE");
  const name = normaliseWorkspaceName(parsed.data.name);
  const result = await repository.create(owner, {
    name,
    invoicePrefix: suggestInvoicePrefix(name),
    currency: "IDR",
  });
  if (!result.ok) throw new WorkspaceError("DUPLICATE_NAME");
  return result;
}
