import type { TEMPLATE_VARIABLES } from "./variable-catalogue";

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

export interface VariableRule {
  readonly allowed: readonly TemplateVariable[];
  readonly required: TemplateVariable;
}
