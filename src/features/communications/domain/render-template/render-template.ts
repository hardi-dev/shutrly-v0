import { DomainError } from "@/shared/errors/domain-error";

import {
  findTemplateProblem,
  normaliseTemplateContent,
  PLACEHOLDER_PATTERN,
  placeholdersIn,
} from "../template-content/template-content";
import type { TemplateType } from "../template-type/template-type.types";
import { isAllowedVariable, isTemplateVariable } from "../variable-catalogue/variable-catalogue";
import type { RenderTemplateErrorCode, TemplateValues } from "./render-template.types";

const LINE_FEED = "\n";
const LAST_CONTROL = 0x1f;
const DELETE = 0x7f;

/** A rendering failure that carries only its code, never content or values (C-103). */
export class RenderTemplateError extends DomainError {
  readonly code: RenderTemplateErrorCode;

  /**
   * Creates a typed rendering failure.
   * @param code - the stable error code
   */
  constructor(code: RenderTemplateErrorCode) {
    super(code);
    this.code = code;
  }
}

function isKeptCharacter(character: string): boolean {
  const point = character.codePointAt(0) ?? 0;
  return character === LINE_FEED || (point > LAST_CONTROL && point !== DELETE);
}

/**
 * Cleans one substitution value: CRLF/CR → LF, other control characters removed, trimmed
 * (BR-MSG-004).
 * @param value - the raw value
 * @returns the sanitised value
 */
export function sanitiseTemplateValue(value: string): string {
  return Array.from(value.replace(/\r\n?/g, LINE_FEED)).filter(isKeptCharacter).join("").trim();
}

function valueOf(values: TemplateValues, name: string): string {
  const value = isTemplateVariable(name) ? values[name] : undefined;
  if (value === undefined) throw new RenderTemplateError("MISSING_VALUE");
  return sanitiseTemplateValue(value);
}

/**
 * Renders a stored template into plain text for F-15 in a single pass, so a value can never
 * introduce a placeholder (BR-MSG-004, BR-MSG-006).
 * @param type - the template type
 * @param content - the stored content
 * @param values - one value per variable the content uses
 * @returns the rendered plain text
 * @throws RenderTemplateError for invalid content, a disallowed variable or a missing value
 */
export function renderTemplate(
  type: TemplateType,
  content: string,
  values: TemplateValues,
): string {
  if (findTemplateProblem(type, content) !== null) throw new RenderTemplateError("INVALID_CONTENT");
  if (Object.keys(values).some((name) => !isAllowedVariable(type, name))) {
    throw new RenderTemplateError("VARIABLE_NOT_ALLOWED");
  }
  const normalised = normaliseTemplateContent(content);
  const resolved = new Map(placeholdersIn(normalised).map((name) => [name, valueOf(values, name)]));
  return normalised.replace(
    PLACEHOLDER_PATTERN,
    (_match, name: string) => resolved.get(name) ?? "",
  );
}
