import "server-only";

import { notFound } from "next/navigation";

import { SourceConfigError } from "@/features/gallery/application/errors/source-config-errors/source-config-errors";
import type { AddSourceInput } from "@/features/gallery/application/schemas/add-source/add-source.types";
import { sourceIdSchema } from "@/features/gallery/application/schemas/source-id/source-id.schema";
import type { SourceNameInput } from "@/features/gallery/application/schemas/source-name/source-name.types";
import { addWorkspaceSource } from "@/features/gallery/application/use-cases/add-workspace-source/add-workspace-source";
import type { SourceWriteResult } from "@/features/gallery/application/use-cases/add-workspace-source/add-workspace-source.types";
import { deleteWorkspaceSource } from "@/features/gallery/application/use-cases/delete-workspace-source/delete-workspace-source";
import type { DeleteSourceResult } from "@/features/gallery/application/use-cases/delete-workspace-source/delete-workspace-source.types";
import { listWorkspaceSources } from "@/features/gallery/application/use-cases/list-workspace-sources/list-workspace-sources";
import { renameWorkspaceSource } from "@/features/gallery/application/use-cases/rename-workspace-source/rename-workspace-source";
import { setWorkspaceSourceActive } from "@/features/gallery/application/use-cases/set-workspace-source-active/set-workspace-source-active";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withSourceConfigScope } from "../source-config-scope/source-config-scope";
import type { PhotoSourcesData } from "./source-config-flow.types";

function sourceIdOrNotFound(rawSourceId: string): string {
  const parsed = sourceIdSchema.safeParse(rawSourceId);
  if (!parsed.success) notFound();
  return parsed.data;
}

function sourceError(
  error: unknown,
  details: { readonly workspaceId: string; readonly sourceId?: string; readonly operation: string },
): never {
  if (error instanceof SourceConfigError && error.code === "NOT_FOUND") notFound();
  if (!(error instanceof DomainError)) logger.error("source_config.save_failed", details);
  throw new SourceConfigError("SAVE_FAILED");
}

export async function loadPhotoSources(rawId: string): Promise<PhotoSourcesData> {
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    const records = await withSourceConfigScope(({ sources }) =>
      listWorkspaceSources(sources, verified.context),
    );
    return {
      sources: records.map(({ id, displayName, provider, isActive }) => ({
        id,
        displayName,
        provider,
        isActive,
      })),
    };
  } catch (error) {
    return sourceError(error, { workspaceId: verified.context.workspaceId, operation: "list" });
  }
}

export async function addPhotoSource(
  rawId: string,
  input: AddSourceInput,
): Promise<SourceWriteResult> {
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    return await withSourceConfigScope(({ sources }) =>
      addWorkspaceSource(sources, verified.context, account.id, input),
    );
  } catch (error) {
    return sourceError(error, { workspaceId: verified.context.workspaceId, operation: "add" });
  }
}

export async function renamePhotoSource(
  rawId: string,
  rawSourceId: string,
  input: SourceNameInput,
): Promise<SourceWriteResult> {
  const sourceId = sourceIdOrNotFound(rawSourceId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    return await withSourceConfigScope(({ sources }) =>
      renameWorkspaceSource(sources, verified.context, sourceId, account.id, input),
    );
  } catch (error) {
    return sourceError(error, {
      workspaceId: verified.context.workspaceId,
      sourceId,
      operation: "rename",
    });
  }
}

export async function setPhotoSourceActive(
  rawId: string,
  rawSourceId: string,
  isActive: boolean,
): Promise<void> {
  const sourceId = sourceIdOrNotFound(rawSourceId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    await withSourceConfigScope(({ sources }) =>
      setWorkspaceSourceActive(sources, verified.context, sourceId, account.id, isActive),
    );
  } catch (error) {
    return sourceError(error, {
      workspaceId: verified.context.workspaceId,
      sourceId,
      operation: "set_active",
    });
  }
}

export async function deletePhotoSource(
  rawId: string,
  rawSourceId: string,
): Promise<DeleteSourceResult> {
  const sourceId = sourceIdOrNotFound(rawSourceId);
  await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    return await withSourceConfigScope(({ sources }) =>
      deleteWorkspaceSource(sources, verified.context, sourceId),
    );
  } catch (error) {
    return sourceError(error, {
      workspaceId: verified.context.workspaceId,
      sourceId,
      operation: "delete",
    });
  }
}
