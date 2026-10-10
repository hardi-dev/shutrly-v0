import type { AppLocale, CatalogMessages, CopyMessages } from "@/shared/locale/locale.types";

export type { CatalogMessages, CopyMessages };

/** The screen group a copy module is delivered to (§5.5), so the landing payload carries no owner copy. */
export type CatalogSurface = "landing" | "auth" | "owner" | "gallery" | "shared";

/** One copy module: an `{ en, id }` pair under one namespace (D-9). */
export type CopyModule = {
  readonly namespace: string;
  readonly surface: CatalogSurface;
  readonly messages: { readonly en: CopyMessages; readonly id: CopyMessages };
};

export type ParityProblemKind = "MISSING" | "EMPTY" | "ARGUMENTS_DIFFER" | "INVALID";

export type ParityProblem = {
  readonly namespace: string;
  readonly key: string;
  readonly problem: ParityProblemKind;
};

export type CatalogLocale = AppLocale;
