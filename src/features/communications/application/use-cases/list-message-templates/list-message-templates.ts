import "server-only";

import { TEMPLATE_TYPES } from "@/features/communications/domain/template-type/template-type";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Lists the verified workspace's templates in journey order (AC-MSG-004, A-5).
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @returns the templates in catalogue order
 */
export async function listMessageTemplates(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly MessageTemplateRecord[]> {
  const records = await repository.listForWorkspace(context);
  return TEMPLATE_TYPES.flatMap((type) => records.filter((record) => record.type === type));
}
