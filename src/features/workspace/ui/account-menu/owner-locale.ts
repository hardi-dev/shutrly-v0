import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";
import type { LanguageSwitchAction } from "@/ui/patterns/language-switch/use-language-switch.types";

import type { OwnerLocaleAction } from "./account-menu.types";

/** The language choices of the owner menus, by self-name key (deck §1). */
export const LANGUAGE_OPTIONS = [
  { locale: "en", labelKey: "english" },
  { locale: "id", labelKey: "indonesian" },
] as const satisfies readonly { locale: AppLocale; labelKey: string }[];

/** The self-name key of a locale: each language is named in itself (deck §1). */
export function languageLabelKey(locale: AppLocale): "english" | "indonesian" {
  return locale === "en" ? "english" : "indonesian";
}

/** The locale the owner shell is rendered in. */
export function useOwnerLocale(): AppLocale {
  return parseAppLocale(useLocale()) ?? DEFAULT_LOCALE;
}

/** Adapts the owner server action to the shared switch: its `undefined` result means saved. */
export function ownerLanguageSwitchAction(action: OwnerLocaleAction): LanguageSwitchAction {
  return async (locale) => (await action({ locale })) === undefined;
}
