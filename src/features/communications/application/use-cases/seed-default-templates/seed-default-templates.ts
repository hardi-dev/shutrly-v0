import "server-only";

import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { MessageTemplateRepositoryPort } from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Gives a workspace its five default templates; types it already has are left untouched
 * (BR-MSG-005, AC-MSG-001).
 * @param repository - message-template persistence port (inside the creation transaction)
 * @param context - the new workspace
 * @returns nothing once the defaults exist
 */
export async function seedDefaultTemplates(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
): Promise<void> {
  await repository.seedDefaults(
    context,
    TEMPLATE_TYPES.map((type) => ({ type, content: DEFAULT_TEMPLATE_CONTENT[type] })),
  );
}
