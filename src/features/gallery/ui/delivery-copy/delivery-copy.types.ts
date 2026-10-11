import type { useTranslations } from "next-intl";

/** The owner delivery translate function, passed into helpers that run outside a component. */
export type DeliveryTranslate = ReturnType<typeof useTranslations>;
