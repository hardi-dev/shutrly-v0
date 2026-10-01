import type { TemplateType } from "../template-type/template-type.types";
import { isAllowedVariable, requiredVariable } from "../variable-catalogue/variable-catalogue";
import type { TemplateContentProblem, TemplateProblemCode } from "./template-content.types";

/** A-1: at most 2,000 characters after trimming. */
export const TEMPLATE_CONTENT_MAX_LENGTH = 2000;

/** A-2: exactly `{{camelCaseName}}`, no spaces inside the braces. */
export const PLACEHOLDER_PATTERN = /\{\{([a-z][A-Za-z0-9]*)\}\}/g;

const BRACE_PAIR = /\{\{|\}\}/;
const PROBLEM_CODES: readonly TemplateProblemCode[] = [
  "EMPTY",
  "TOO_LONG",
  "MALFORMED",
  "UNKNOWN_VARIABLE",
  "MISSING_REQUIRED",
];

/**
 * Trims leading and trailing whitespace and keeps inner line breaks (A-1).
 * @param raw - the content as typed
 * @returns the content as stored
 */
export function normaliseTemplateContent(raw: string): string {
  return raw.trim();
}

/**
 * Counts the stored length in code points, matching Postgres `char_length` (A-1).
 * @param raw - the content as typed
 * @returns the trimmed length
 */
export function templateContentLength(raw: string): number {
  return Array.from(normaliseTemplateContent(raw)).length;
}

/**
 * Lists the names of the well-formed placeholders, in order of appearance.
 * @param content - template content
 * @returns the placeholder names
 */
export function placeholdersIn(content: string): string[] {
  return Array.from(content.matchAll(PLACEHOLDER_PATTERN), (match) => match[1]);
}

/**
 * Finds the first rule a template's content breaks, in the order empty, too long, malformed,
 * unknown variable, missing required link (A-1, A-2, BR-MSG-006).
 * @param type - the template type
 * @param raw - the content as typed
 * @returns the problem, or null when the content can be stored
 */
export function findTemplateProblem(
  type: TemplateType,
  raw: string,
): TemplateContentProblem | null {
  const content = normaliseTemplateContent(raw);
  if (content.length === 0) return { code: "EMPTY" };
  if (templateContentLength(content) > TEMPLATE_CONTENT_MAX_LENGTH) return { code: "TOO_LONG" };
  if (BRACE_PAIR.test(content.replace(PLACEHOLDER_PATTERN, ""))) return { code: "MALFORMED" };
  const names = placeholdersIn(content);
  const unknown = names.find((name) => !isAllowedVariable(type, name));
  if (unknown !== undefined) return { code: "UNKNOWN_VARIABLE", variable: unknown };
  const required = requiredVariable(type);
  return names.includes(required) ? null : { code: "MISSING_REQUIRED", variable: required };
}

/**
 * Encodes a problem as the stable key carried by form and server field errors.
 * @param problem - the content problem
 * @returns `CODE` or `CODE:variable`
 */
export function toProblemKey(problem: TemplateContentProblem): string {
  return "variable" in problem ? `${problem.code}:${problem.variable}` : problem.code;
}

/**
 * Decodes a field-error key back into a content problem.
 * @param key - a key made by toProblemKey
 * @returns the problem, or null for an unknown key
 */
export function parseProblemKey(key: string): TemplateContentProblem | null {
  const [code, variable] = key.split(":");
  const known = PROBLEM_CODES.find((candidate) => candidate === code);
  if (known === undefined) return null;
  if (known === "UNKNOWN_VARIABLE" || known === "MISSING_REQUIRED") {
    return variable ? { code: known, variable } : null;
  }
  return { code: known };
}

/**
 * Builds the field-error key for an untrusted input that failed validation.
 * @param type - the template type
 * @param input - the raw form or request value
 * @returns the problem key (EMPTY when the input is not a string)
 */
export function problemKeyFor(type: TemplateType, input: unknown): string {
  const problem = findTemplateProblem(type, typeof input === "string" ? input : "");
  return toProblemKey(problem ?? { code: "EMPTY" });
}
