import {
  renderTemplate,
  RenderTemplateError,
} from "@/features/communications/domain/render-template/render-template";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import {
  allowedVariables,
  isAllowedVariable,
} from "@/features/communications/domain/variable-catalogue/variable-catalogue";
import type { TemplateVariable } from "@/features/communications/domain/variable-catalogue/variable-catalogue.types";

import { MESSAGE_PREVIEW_COPY as COPY } from "./message-preview.copy";

function sampleValue(name: TemplateVariable, brandName: string): string {
  return name === "brandName" ? brandName : COPY.sample[name];
}

/**
 * Renders the live preview with sample data and the workspace's brand name (A-6).
 * @param type - the template type
 * @param content - the content as typed
 * @param brandName - the workspace's client-facing name
 * @returns the preview text, or null when the content is invalid
 */
export function renderPreview(
  type: TemplateType,
  content: string,
  brandName: string,
): string | null {
  const values = Object.fromEntries(
    allowedVariables(type).map((name) => [name, sampleValue(name, brandName)]),
  );
  try {
    return renderTemplate(type, content, values);
  } catch (error) {
    if (error instanceof RenderTemplateError) return null;
    throw error;
  }
}

/**
 * Tells whether the preview needs the password re-entry note (BR-MSG-003).
 * @param type - the template type
 * @returns whether the type can use galleryPassword
 */
export function previewHasPasswordNote(type: TemplateType): boolean {
  return isAllowedVariable(type, "galleryPassword");
}
