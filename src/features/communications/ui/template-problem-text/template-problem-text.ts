import {
  parseProblemKey,
  TEMPLATE_CONTENT_MAX_LENGTH,
} from "@/features/communications/domain/template-content/template-content";
import { templateGroupOf } from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { TEMPLATE_COPY } from "../template-copy/template-copy.copy";
import { TEMPLATE_PROBLEM_COPY as COPY } from "./template-problem-text.copy";

// Frozen per-locale lookup (§5.6): the limit is written as "2.000" in Indonesian, "2,000" in English.
const NUMBER: Readonly<Record<FormattingLocale, Intl.NumberFormat>> = Object.freeze({
  "id-ID": new Intl.NumberFormat("id-ID"),
  "en-US": new Intl.NumberFormat("en-US"),
});

/**
 * Translates a content problem key into the Indonesian field error shown under the textarea.
 * @param type - the template type being edited
 * @param key - the field error key from the form or the server, if any
 * @param locale - the formatting locale for the limit
 * @returns the message, or undefined when there is no error
 */
export function templateProblemText(
  type: TemplateType,
  key: string | undefined,
  locale: FormattingLocale,
): string | undefined {
  if (!key) return undefined;
  const problem = parseProblemKey(key);
  if (!problem) return COPY.fallback;
  switch (problem.code) {
    case "EMPTY":
      return COPY.empty;
    case "TOO_LONG":
      return COPY.tooLong(NUMBER[locale].format(TEMPLATE_CONTENT_MAX_LENGTH));
    case "MALFORMED":
      return COPY.malformed;
    case "UNKNOWN_VARIABLE":
      return COPY.unknownVariable(problem.variable, TEMPLATE_COPY[type].label);
    case "MISSING_REQUIRED":
      return COPY.missingRequired(
        problem.variable,
        templateGroupOf(type) === "INVOICE" ? COPY.invoice : COPY.gallery,
      );
  }
}
