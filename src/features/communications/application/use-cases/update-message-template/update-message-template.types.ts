import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import type { MessageTemplateContentInput } from "../../schemas/message-template-content/message-template-content.types";

/** `default` stores the platform default (is_default, no text); `custom` stores the sent text. */
export type TemplateSaveMode = "custom" | "default";

export interface UpdateMessageTemplateCommand {
  readonly type: TemplateType;
  readonly mode: TemplateSaveMode;
  readonly editorUserId: string;
  readonly input: MessageTemplateContentInput;
}

export interface UpdateMessageTemplateFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: { readonly content: string };
}

export type UpdateMessageTemplateResult = { readonly ok: true } | UpdateMessageTemplateFailure;
