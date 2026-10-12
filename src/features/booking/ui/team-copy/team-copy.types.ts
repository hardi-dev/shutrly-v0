import type { useTranslations } from "next-intl";

/** The team translate function, passed into helpers that run outside a component. */
export type TeamTranslate = ReturnType<typeof useTranslations>;
