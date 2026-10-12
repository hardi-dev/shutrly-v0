import type { useTranslations } from "next-intl";

/** The selection translate function, passed into helpers that run outside a component. */
export type SelectionOwnerTranslate = ReturnType<typeof useTranslations>;
