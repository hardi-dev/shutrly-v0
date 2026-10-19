"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PHOTOS_CARD_COPY_NAMESPACE } from "./photos-card.copy";
import type { PhotosCardProps } from "./photos-card.types";

/** *Foto*: the counts, visibility and the first photos, or the plain empty text before the first sync (AC-GAL-014). */
export function PhotosCard({
  hasPhotos,
  description,
  actions,
  children,
}: Readonly<PhotosCardProps>) {
  const t = useTranslations(PHOTOS_CARD_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const emptyDescription = isMobile ? t("photosDescriptionMobile") : t("photosDescriptionEmpty");
  return (
    <SectionCard
      title={t("photosTitle")}
      description={hasPhotos ? description : emptyDescription}
      actions={actions}
    >
      {hasPhotos ? (
        children
      ) : (
        <div className="flex flex-col gap-(--space-2) p-(--space-4) md:p-(--space-6)">
          <p className="text-(length:--font-size-body) font-semibold text-(--color-semantic-text-primary)">
            {t("photosEmptyTitle")}
          </p>
          <p className="text-(length:--font-size-body-sm) text-(--color-semantic-text-secondary)">
            {t("photosEmptyBody")}
          </p>
        </div>
      )}
    </SectionCard>
  );
}
