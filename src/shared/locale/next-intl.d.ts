import type { AppLocale, CatalogMessages } from "./locale.types";

// next-intl's typed locale and messages (§5.5): the app locale and the catalog shape.
declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: CatalogMessages;
  }
}
