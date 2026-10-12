"use server";

import { revalidatePath } from "next/cache";

import { saveMessageTemplate } from "@/composition/communications/message-template-flow/message-template-flow";
import type { MessageTemplateContentInput } from "@/features/communications/application/schemas/message-template-content/message-template-content.types";
import type {
  TemplateSaveMode,
  UpdateMessageTemplateFailure,
} from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";

export async function saveMessageTemplateAction(
  workspaceId: string,
  slug: string,
  values: MessageTemplateContentInput,
  mode: TemplateSaveMode,
): Promise<UpdateMessageTemplateFailure | undefined> {
  const result = await saveMessageTemplate(workspaceId, slug, values, mode);
  if (!result.ok) return result;
  revalidatePath("/w/[workspaceId]/message-templates", "page");
  return undefined;
}
