import type { useTranslations } from "next-intl";

/** The photo sources translate function, passed into helpers that run outside a component. */
export type SourceTranslate = ReturnType<typeof useTranslations>;
