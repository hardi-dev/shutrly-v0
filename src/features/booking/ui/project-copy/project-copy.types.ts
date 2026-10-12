import type { useTranslations } from "next-intl";

/** The project translate function, passed into helpers that run outside a component. */
export type ProjectTranslate = ReturnType<typeof useTranslations>;
