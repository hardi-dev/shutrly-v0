import {
  parseProblemKey,
  TEMPLATE_CONTENT_MAX_LENGTH,
} from "@/features/communications/domain/template-content/template-content";
import { templateGroupOf } from "@/features/communications/domain/template-type/template-type";
import type { TemplateType } from "@/features/communications/domain/template-type/template-type.types";

import {
  TEMPLATE_LABEL_MESSAGE_KEY,
  TEMPLATE_PROBLEM_TARGET_KEY,
} from "../template-copy/template-copy.copy";
import type { TemplateTranslate } from "../template-copy/template-copy.types";

/**
 * Translates a content problem key into the field error shown under the textarea (deck §11.3).
 * The limit is formatted by the translator's active locale.
 * @param t - the template translator
 * @param type - the template type being edited
 * @param key - the field error key from the form or the server, if any
 * @returns the message, or undefined when there is no error
 */
export function templateProblemText(
  t: TemplateTranslate,
  type: TemplateType,
  key: string | undefined,
): string | undefined {
  if (!key) return undefined;
  const problem = parseProblemKey(key);
  if (!problem) return t("problemGeneric");
  return problemMessage(t, type, problem);
}

function problemMessage(
  t: TemplateTranslate,
  type: TemplateType,
  problem: NonNullable<ReturnType<typeof parseProblemKey>>,
): string {
  switch (problem.code) {
    case "EMPTY":
      return t("problemEmpty");
    case "TOO_LONG":
      return t("problemTooLong", { max: TEMPLATE_CONTENT_MAX_LENGTH });
    case "MALFORMED":
      return t("problemMalformed");
    case "UNKNOWN_VARIABLE":
      return t("problemUnknownVariable", {
        variable: problem.variable,
        templateName: t(TEMPLATE_LABEL_MESSAGE_KEY[type]),
      });
    case "MISSING_REQUIRED":
      return t("problemMissingRequired", {
        variable: problem.variable,
        target: t(TEMPLATE_PROBLEM_TARGET_KEY[templateGroupOf(type)]),
      });
  }
}
