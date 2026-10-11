import "server-only";

import type { AppLocale } from "@/shared/locale/locale.types";

import type { CatalogMessages, CatalogSurface, CopyModule } from "./message-catalog.types";

/**
 * Build the next-intl catalog for one locale from copy modules. The result is frozen, so it can
 * be shared across requests.
 * @param registry - the copy modules, passed in by the app layer (D-8)
 * @param locale - the locale to pick
 * @returns namespace → key → ICU string for that locale
 */
export function buildCatalog(registry: readonly CopyModule[], locale: AppLocale): CatalogMessages {
  const catalog: Record<string, Readonly<Record<string, string>>> = {};
  for (const copyModule of registry) {
    catalog[copyModule.namespace] = Object.freeze({ ...copyModule.messages[locale] });
  }
  return Object.freeze(catalog);
}

/**
 * Build the catalog for the screens of the given surfaces only, so the landing payload carries no
 * owner copy (§5.5, R-6).
 * @param locale - the locale to pick
 * @param surfaces - the surfaces this response renders
 * @param registry - the copy modules, passed in by the app layer (D-8)
 * @returns the catalog for those surfaces in that locale
 */
export function messagesFor(
  locale: AppLocale,
  surfaces: readonly CatalogSurface[],
  registry: readonly CopyModule[],
): CatalogMessages {
  return buildCatalog(
    registry.filter((copyModule) => surfaces.includes(copyModule.surface)),
    locale,
  );
}
