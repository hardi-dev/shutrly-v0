import type { useTranslations } from "next-intl";

/** The service-catalog translate function, passed into helpers that run outside a component. */
export type CatalogTranslate = ReturnType<typeof useTranslations>;
