import type { TEMPLATE_TYPES } from "./template-type";

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export type TemplateGroup = "GALLERY" | "INVOICE";
