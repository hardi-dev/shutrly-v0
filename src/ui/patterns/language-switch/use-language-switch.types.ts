import type { AppLocale } from "@/shared/locale/locale.types";

/** Saves the chosen language; resolves true when it was saved. */
export type LanguageSwitchAction = (locale: AppLocale) => Promise<boolean>;

export interface LanguageSwitchState {
  pendingLocale: AppLocale | null;
  selectLocale: (locale: AppLocale) => Promise<void>;
}
