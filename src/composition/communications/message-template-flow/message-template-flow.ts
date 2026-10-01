import "server-only";

import { notFound } from "next/navigation";

import { MessageTemplateError } from "@/features/communications/application/errors/message-template-errors/message-template-errors";
import type { MessageTemplateContentInput } from "@/features/communications/application/schemas/message-template-content/message-template-content.types";
import { getMessageTemplate } from "@/features/communications/application/use-cases/get-message-template/get-message-template";
import { listMessageTemplates } from "@/features/communications/application/use-cases/list-message-templates/list-message-templates";
import { updateMessageTemplate } from "@/features/communications/application/use-cases/update-message-template/update-message-template";
import type { UpdateMessageTemplateResult } from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";
import { DEFAULT_TEMPLATE_CONTENT } from "@/features/communications/domain/default-templates/default-templates";
import { templateTypeFromSlug } from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import { getWorkspaceProfile } from "@/features/workspace/application/use-cases/get-workspace-profile/get-workspace-profile";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withMessageTemplateScope } from "../message-template-scope/message-template-scope";
import type {
  MessageTemplateEditorData,
  MessageTemplateListData,
} from "./message-template-flow.types";

function typeOrNotFound(slug: string): TemplateType {
  const type = templateTypeFromSlug(slug);
  if (!type) notFound();
  return type;
}

/**
 * Loads the template list of a verified workspace (AC-MSG-004).
 * @param rawId - untrusted route workspace ID
 * @returns the template types the workspace has, in journey order
 */
export async function loadMessageTemplateList(rawId: string): Promise<MessageTemplateListData> {
  const verified = await verifyOwnerWorkspace(rawId);
  const records = await withMessageTemplateScope(({ templates }) =>
    listMessageTemplates(templates, verified.context),
  );
  return { types: records.map((record) => record.type) };
}

/**
 * Loads one template, its default and the brand name for the preview (AC-MSG-005, A-6).
 * @param rawId - untrusted route workspace ID
 * @param slug - untrusted route template slug
 * @returns the editor data
 * @throws Next notFound for an unknown slug, a missing template or an unowned workspace
 */
export async function loadMessageTemplateEditor(
  rawId: string,
  slug: string,
): Promise<MessageTemplateEditorData> {
  const type = typeOrNotFound(slug);
  const verified = await verifyOwnerWorkspace(rawId);
  return withMessageTemplateScope(async ({ templates, workspaces }) => {
    const record = await getMessageTemplate(templates, verified.context, type).catch(
      notFoundOnMissing,
    );
    const profile = await getWorkspaceProfile(workspaces, verified.context);
    // BR-WS-004: clients see the brand name, falling back to the workspace name.
    const brandName = profile?.brandName ?? profile?.name ?? verified.workspace.name;
    return {
      type,
      content: record.content,
      defaultContent: DEFAULT_TEMPLATE_CONTENT[type],
      brandName,
    };
  });
}

function notFoundOnMissing(error: unknown): never {
  if (error instanceof MessageTemplateError && error.code === "NOT_FOUND") notFound();
  throw error;
}

/**
 * Saves one template of the verified workspace; unexpected failures are logged with the type
 * only and surface as a generic retryable error (AC-MSG-012, AC-MSG-019).
 * @param rawId - bound route workspace ID
 * @param slug - bound route template slug
 * @param input - untrusted content
 * @returns success or the content field error
 */
export async function saveMessageTemplate(
  rawId: string,
  slug: string,
  input: MessageTemplateContentInput,
): Promise<UpdateMessageTemplateResult> {
  const type = typeOrNotFound(slug);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawId);
  try {
    return await withMessageTemplateScope(({ templates }) =>
      updateMessageTemplate(templates, verified.context, {
        type,
        editorUserId: account.id,
        input,
      }),
    );
  } catch (error) {
    if (error instanceof MessageTemplateError && error.code === "NOT_FOUND") notFound();
    if (!(error instanceof DomainError)) logger.error("message_template.save_failed", { type });
    throw new MessageTemplateError("SAVE_FAILED");
  }
}
