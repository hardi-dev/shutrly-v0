import type { useTranslations } from "next-intl";

/** The client gallery translate function, passed into helpers that run outside a component. */
export type ClientTranslate = ReturnType<typeof useTranslations>;
