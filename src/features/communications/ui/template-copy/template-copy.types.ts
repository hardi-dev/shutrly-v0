import type { useTranslations } from "next-intl";

/** The message template translate function, passed into helpers that run outside a component. */
export type TemplateTranslate = ReturnType<typeof useTranslations>;
