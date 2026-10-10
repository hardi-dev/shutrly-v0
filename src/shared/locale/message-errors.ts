import { logger } from "@/shared/logging/logger";

import type { AppLocale } from "./locale.types";

/** The fields of next-intl's IntlError that the contract reads (structural, no extra import). */
export type IntlErrorLike = { readonly code: string; readonly message: string };

/**
 * Build the next-intl error handler. Outside production a missing or invalid message throws, so
 * it is found in development and tests. In production it is logged (no user data) and the empty
 * fallback renders. The other language is never used (D-10).
 * @param locale - the locale being rendered
 * @param strict - true to throw on error (every stage except production)
 * @returns the handler to pass as `onError`
 */
export function createMessageErrorHandler(
  locale: AppLocale,
  strict: boolean,
): (error: IntlErrorLike) => void {
  return (error) => {
    if (strict) throw new Error(`${error.code} in locale ${locale}`);
    const event =
      error.code === "MISSING_MESSAGE"
        ? "l10n.missing_message"
        : `l10n.${error.code.toLowerCase()}`;
    logger.error(event, { locale });
  };
}

/**
 * The text rendered for a message that cannot be produced. It is empty: never the key, and never
 * a string from the other language (D-10).
 * @returns the empty string
 */
export function messageFallback(): string {
  return "";
}
