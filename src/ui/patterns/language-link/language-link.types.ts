import type { AppLocale } from "@/shared/locale/locale.types";

export interface LanguageLinkProps {
  currentLocale: AppLocale;
  pendingLocale: AppLocale | null;
  onSelect: (locale: AppLocale) => void;
}

/** The strings the link shows, read from the shared `languageSwitch` copy module. */
export interface LanguageLinkCopy {
  name: string;
  english: string;
  indonesian: string;
  changing: string;
}

export interface LanguageTriggerProps {
  "aria-label"?: string;
  currentLocale: AppLocale;
  pendingLocale: AppLocale | null;
  copy: LanguageLinkCopy;
  onPress?: () => void;
}

/** One language row in the menu or sheet, with the copy key of its self-name. */
export interface OptionLocale {
  locale: AppLocale;
  labelKey: "english" | "indonesian";
}
