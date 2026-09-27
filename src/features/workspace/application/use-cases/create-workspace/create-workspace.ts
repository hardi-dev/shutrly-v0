import "server-only";

import { suggestInvoicePrefix } from "@/features/workspace/domain/invoice-prefix/invoice-prefix";
import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import { normaliseWorkspaceName } from "@/features/workspace/domain/workspace-name/workspace-name";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import { createWorkspaceSchema } from "./create-workspace.schema";
import type { CreateWorkspaceInput } from "./create-workspace.types";

/** Creates an additional IDR workspace and makes it latest through the insert timestamp. @param repository - workspace persistence port @param owner - authenticated owner ID @param input - untrusted create fields @returns the created workspace ID @throws WorkspaceError for validation or duplicate failures */
export async function createWorkspace(
  repository: WorkspaceRepositoryPort,
  owner: OwnerUserId,
  input: CreateWorkspaceInput,
) {
  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) throw new WorkspaceError("VALIDATION_FAILED");
  const name = normaliseWorkspaceName(parsed.data.name);
  const result = await repository.create(owner, {
    name,
    invoicePrefix: suggestInvoicePrefix(name),
    currency: "IDR",
  });
  if (!result.ok) throw new WorkspaceError("DUPLICATE_NAME");
  return result;
}
