"use client";

import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";
import { LanguageLink } from "@/ui/patterns/language-link/language-link";
import { useLanguageSwitch } from "@/ui/patterns/language-switch/use-language-switch";

import type { AuthLanguageSwitchProps } from "./auth-language-switch.types";

/**
 * The auth header's language link. Saves the choice to the device cookie, then refreshes the page.
 * @param props - the device-locale save action
 * @returns the language link wired to the shared switch behaviour
 */
export function AuthLanguageSwitch({ action }: Readonly<AuthLanguageSwitchProps>) {
  const currentLocale: AppLocale = parseAppLocale(useLocale()) ?? DEFAULT_LOCALE;
  const saveLocale = async (locale: AppLocale): Promise<boolean> => (await action({ locale })).ok;
  const { pendingLocale, selectLocale } = useLanguageSwitch(currentLocale, saveLocale);
  const handleSelect = (locale: AppLocale) => {
    void selectLocale(locale);
  };
  return (
    <LanguageLink
      currentLocale={currentLocale}
      pendingLocale={pendingLocale}
      onSelect={handleSelect}
    />
  );
}
