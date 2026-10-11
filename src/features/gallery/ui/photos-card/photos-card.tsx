"use client";

import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PHOTOS_CARD_COPY_NAMESPACE } from "./photos-card.copy";
import type { PhotosCardProps } from "./photos-card.types";

/** *Foto*: the counts, visibility and the first photos, or an empty state before the first sync (AC-GAL-014). */
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
        <EmptyState
          icon="images"
          placement="in-card"
          title={t("photosEmptyTitle")}
          body={t("photosEmptyBody")}
        />
      )}
    </SectionCard>
  );
}
