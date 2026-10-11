import type { useTranslations } from "next-intl";

/** The client translate function, passed into helpers that run outside a component. */
export type ClientTranslate = ReturnType<typeof useTranslations>;
