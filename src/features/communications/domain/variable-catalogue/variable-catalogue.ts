import type { TemplateType } from "../template-type/template-type.types";
import type { TemplateVariable, VariableRule } from "./variable-catalogue.types";

export const TEMPLATE_VARIABLES = [
  "clientName",
  "projectTitle",
  "brandName",
  "galleryUrl",
  "galleryPassword",
  "invoiceNumber",
  "invoiceTotal",
  "invoiceBalance",
  "invoiceUrl",
] as const;

const COMMON: readonly TemplateVariable[] = ["clientName", "projectTitle", "brandName"];

// BR-MSG-006 catalogue, approved by the Owner 2026-09-28. Order = chip order in the editor.
const CATALOGUE: Readonly<Record<TemplateType, VariableRule>> = {
  GALLERY_SHARE: { allowed: [...COMMON, "galleryUrl", "galleryPassword"], required: "galleryUrl" },
  SELECTION_REMINDER: { allowed: [...COMMON, "galleryUrl"], required: "galleryUrl" },
  FINAL_DELIVERY: { allowed: [...COMMON, "galleryUrl", "galleryPassword"], required: "galleryUrl" },
  INVOICE_SHARE: {
    allowed: [...COMMON, "invoiceNumber", "invoiceTotal", "invoiceUrl"],
    required: "invoiceUrl",
  },
  PAYMENT_REMINDER: {
    allowed: [...COMMON, "invoiceNumber", "invoiceTotal", "invoiceBalance", "invoiceUrl"],
    required: "invoiceUrl",
  },
};

/**
 * Lists the variables a template type may use, in chip order (BR-MSG-006).
 * @param type - the template type
 * @returns the allowed variables
 */
export function allowedVariables(type: TemplateType): readonly TemplateVariable[] {
  return CATALOGUE[type].allowed;
}

/**
 * Names the link variable a template type must contain (BR-MSG-006).
 * @param type - the template type
 * @returns the required variable
 */
export function requiredVariable(type: TemplateType): TemplateVariable {
  return CATALOGUE[type].required;
}

/**
 * Checks that a name is one of the catalogue's variables.
 * @param name - a placeholder name
 * @returns whether the name is a template variable
 */
export function isTemplateVariable(name: string): name is TemplateVariable {
  return TEMPLATE_VARIABLES.some((variable) => variable === name);
}

/**
 * Checks that a placeholder name is allowed for a template type (BR-MSG-006).
 * @param type - the template type
 * @param name - the placeholder name
 * @returns whether the type allows the variable
 */
export function isAllowedVariable(type: TemplateType, name: string): boolean {
  return allowedVariables(type).some((variable) => variable === name);
}
