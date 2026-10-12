import "server-only";

import { renderTemplate } from "@/features/communications/domain/render-template/render-template";
import type { TemplateValues } from "@/features/communications/domain/render-template/render-template.types";
import { resolveTemplateContent } from "@/features/communications/domain/resolve-template-content/resolve-template-content";
import type {
  ResolvableTemplate,
  ResolveLanguage,
} from "@/features/communications/domain/resolve-template-content/resolve-template-content.types";

/**
 * Renders a template for one recipient in the language the owner chose for that message (D-16,
 * BR-L10N-006). The request locale is never read (AC-L10N-010).
 * @param template - the stored template fields
 * @param language - the recipient language chosen for this message
 * @param values - one value per variable the template uses
 * @returns the rendered plain text
 */
export function renderTemplateForRecipient(
  template: ResolvableTemplate,
  language: ResolveLanguage,
  values: TemplateValues,
): string {
  const content = resolveTemplateContent(template, language);
  return renderTemplate(template.type, content, values);
}
