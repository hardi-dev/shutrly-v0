import type { useTranslations } from "next-intl";

/** The add-on translate function, passed into helpers that run outside a component. */
export type AddOnTranslate = ReturnType<typeof useTranslations>;
