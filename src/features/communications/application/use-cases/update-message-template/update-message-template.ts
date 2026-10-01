import "server-only";

import { normaliseTemplateContent } from "@/features/communications/domain/template-content/template-content";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { MessageTemplateError } from "../../errors/message-template-errors/message-template-errors";
import type { MessageTemplateRepositoryPort } from "../../ports/message-template-repository/message-template-repository.port";
import { messageTemplateContentSchema } from "../../schemas/message-template-content/message-template-content.schema";
import type {
  UpdateMessageTemplateCommand,
  UpdateMessageTemplateResult,
} from "./update-message-template.types";

/**
 * Re-validates and stores one template's content for the verified workspace, recording the
 * editor and time (AC-MSG-007…011, A-9); invalid content returns a field error and stores
 * nothing.
 * @param repository - message-template persistence port
 * @param context - ownership-verified workspace context
 * @param command - template type, editor and untrusted input
 * @returns success, or the content field error key
 * @throws MessageTemplateError NOT_FOUND when the workspace has no template of that type
 */
export async function updateMessageTemplate(
  repository: MessageTemplateRepositoryPort,
  context: WorkspaceContext,
  command: UpdateMessageTemplateCommand,
): Promise<UpdateMessageTemplateResult> {
  const parsed = messageTemplateContentSchema(command.type).safeParse(command.input);
  if (!parsed.success) {
    const key = parsed.error.issues.at(0)?.message ?? "EMPTY";
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { content: key } };
  }
  const updated = await repository.updateContent(context, {
    type: command.type,
    content: normaliseTemplateContent(parsed.data.content),
    editorUserId: command.editorUserId,
  });
  if (!updated) throw new MessageTemplateError("NOT_FOUND");
  return { ok: true };
}
