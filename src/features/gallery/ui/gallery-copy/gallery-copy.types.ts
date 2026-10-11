import type { useTranslations } from "next-intl";

/** The gallery translate function, passed into helpers that run outside a component. */
export type GalleryTranslate = ReturnType<typeof useTranslations>;
