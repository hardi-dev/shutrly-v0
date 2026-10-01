import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { UpdateMessageTemplateFailure } from "@/features/communications/application/use-cases/update-message-template/update-message-template.types";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

export interface TemplateFormValues {
  content: string;
}

export type SaveTemplateAction = (
  values: TemplateFormValues,
) => Promise<UpdateMessageTemplateFailure | undefined>;

export interface TemplateFormOptions {
  type: TemplateType;
  content: string;
  defaultContent: string;
  action: SaveTemplateAction;
  onSaved: () => void;
  onFailed: (retry: () => void) => void;
}

export interface TemplateForm {
  form: UseFormReturn<TemplateFormValues>;
  setTextarea: (element: HTMLTextAreaElement | null) => void;
  content: string;
  isDirty: boolean;
  isSubmitting: boolean;
  onSubmit: (event?: BaseSyntheticEvent) => void;
  insertVariable: (name: TemplateVariable) => void;
  restoreDefault: () => void;
}
