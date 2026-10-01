import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

export interface MessageTemplateListData {
  readonly types: readonly TemplateType[];
}

export interface MessageTemplateEditorData {
  readonly type: TemplateType;
  readonly content: string;
  readonly defaultContent: string;
  readonly brandName: string;
}
