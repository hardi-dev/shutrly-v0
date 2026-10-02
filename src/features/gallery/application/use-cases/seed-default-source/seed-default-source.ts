import "server-only";

import { DEFAULT_SOURCE } from "@/features/gallery/domain/default-source/default-source";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceSourceRepositoryPort } from "../../ports/workspace-source-repository/workspace-source-repository.port";

export async function seedDefaultSource(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
): Promise<void> {
  await repository.seedDefault(context, { ...DEFAULT_SOURCE, editorUserId: null });
}
