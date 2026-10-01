import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import type {
  SaveTemplateAction,
  TemplateForm,
} from "../use-template-form/use-template-form.types";

export interface TemplateEditorData {
  readonly type: TemplateType;
  readonly content: string;
  readonly defaultContent: string;
  readonly brandName: string;
}

export interface TemplateEditorScreenProps {
  editor: TemplateEditorData;
  action: SaveTemplateAction;
}

export interface EditorPartProps {
  template: TemplateForm;
  type: TemplateType;
  isMobile: boolean;
}

export interface EditorLayoutProps extends EditorPartProps {
  preview: string | null;
}
