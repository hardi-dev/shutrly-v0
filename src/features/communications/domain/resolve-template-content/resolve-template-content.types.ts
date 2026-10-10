import type { AppLocale } from "@/shared/locale/locale.types";

import type { TemplateType } from "../template-type/template-type.types";

/** The stored fields that decide which text a template shows. */
export type ResolvableTemplate = {
  isDefault: boolean;
  content: string | null;
  type: TemplateType;
};

/** The language whose default text a platform-default template shows. */
export type ResolveLanguage = AppLocale;
