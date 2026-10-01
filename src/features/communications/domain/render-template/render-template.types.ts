import type { TemplateVariable } from "../variable-catalogue/variable-catalogue.types";

export type TemplateValues = Partial<Readonly<Record<TemplateVariable, string>>>;

export type RenderTemplateErrorCode = "INVALID_CONTENT" | "VARIABLE_NOT_ALLOWED" | "MISSING_VALUE";
