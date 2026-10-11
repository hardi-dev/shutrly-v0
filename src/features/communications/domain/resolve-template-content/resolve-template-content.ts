import { DEFAULT_TEMPLATE_CONTENT } from "../default-templates/default-templates";
import type { ResolvableTemplate, ResolveLanguage } from "./resolve-template-content.types";

/**
 * Returns the text a template shows in a language (D-15). A platform default follows the language;
 * a custom template is sent as written, whatever the language (D-11).
 * @param template - the stored template fields
 * @param language - the language to show the default in
 * @returns the template text
 * @throws Error when a custom template has no content, which is a stored-data bug (never shown to the user)
 */
export function resolveTemplateContent(
  template: ResolvableTemplate,
  language: ResolveLanguage,
): string {
  if (template.isDefault) return DEFAULT_TEMPLATE_CONTENT[language][template.type];
  if (template.content === null) throw new Error("custom template has no content");
  return template.content;
}
