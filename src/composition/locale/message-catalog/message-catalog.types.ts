import type { AppLocale } from "@/shared/locale/locale.types";

/** The screen group a copy module is delivered to (§5.5), so the landing payload carries no owner copy. */
export type CatalogSurface = "landing" | "auth" | "owner" | "gallery" | "shared";

/** ICU message strings keyed by message key. Plurals and selects are ICU syntax inside the string. */
export type CopyMessages = Readonly<Record<string, string>>;

/** One copy module: an `{ en, id }` pair under one namespace (D-9). */
export type CopyModule = {
  readonly namespace: string;
  readonly surface: CatalogSurface;
  readonly messages: { readonly en: CopyMessages; readonly id: CopyMessages };
};

/** The catalog handed to next-intl: namespace → key → ICU string. */
export type CatalogMessages = Readonly<Record<string, CopyMessages>>;

export type ParityProblemKind = "MISSING" | "EMPTY" | "ARGUMENTS_DIFFER" | "INVALID";

export type ParityProblem = {
  readonly namespace: string;
  readonly key: string;
  readonly problem: ParityProblemKind;
};

export type CatalogLocale = AppLocale;
