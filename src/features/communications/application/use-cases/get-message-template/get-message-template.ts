import "server-only";

import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { MessageTemplateError } from "../../errors/message-template-errors/message-template-errors";
import type {
  MessageTemplateRecord,
  MessageTemplateRepositoryPort,
} from "../../ports/message-template-repository/message-template-repository.port";

/**
 * Loads one template of the verified workspace for the editor (AC-MSG-005).
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @param type - the template type from the route
 * @returns the stored template
 * @throws MessageTemplateError NOT_FOUND when the workspace has no template of that type
 */
export async function getMessageTemplate(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
  type: TemplateType,
): Promise<MessageTemplateRecord> {
  const record = await repository.findByType(context, type);
  if (!record) throw new MessageTemplateError("NOT_FOUND");
  return record;
}
