import { createTranslator } from "next-intl";

import { COPY_REGISTRY } from "@/app/copy-registry";
import type { AppLocale } from "@/shared/locale/locale.types";

/**
 * Every registered copy module's messages for one locale, keyed by namespace. This is the same
 * catalog shape the app's request config builds, so tests read the real copy.
 * @param locale - the locale to pick
 * @returns namespace → key → ICU string
 */
export function copyMessages(locale: AppLocale) {
  return Object.fromEntries(
    COPY_REGISTRY.map((copyModule) => [copyModule.namespace, copyModule.messages[locale]]),
  );
}

/**
 * A translator for one copy namespace, for tests that call copy functions outside a component.
 * @param namespace - the copy module namespace
 * @param locale - the locale to translate into
 * @returns the next-intl translate function for that namespace
 */
export function copyTranslator(namespace: string, locale: AppLocale = "id") {
  return createTranslator({ locale, messages: copyMessages(locale), namespace });
}
