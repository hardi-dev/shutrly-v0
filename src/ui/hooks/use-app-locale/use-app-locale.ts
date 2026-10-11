"use client";

import { useLocale } from "next-intl";

import { DEFAULT_LOCALE, parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";

/**
 * The app locale the screen is rendered in, from the server-resolved provider (C-004).
 * @returns `en` or `id`, following the provider locale
 */
export function useAppLocale(): AppLocale {
  return parseAppLocale(useLocale()) ?? DEFAULT_LOCALE;
}
