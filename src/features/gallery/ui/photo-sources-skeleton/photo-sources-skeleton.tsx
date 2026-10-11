import { useTranslations } from "next-intl";

import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PHOTO_SOURCES_SKELETON_COPY_NAMESPACE } from "./photo-sources-skeleton.copy";

export function PhotoSourcesSkeleton() {
  const t = useTranslations(PHOTO_SOURCES_SKELETON_COPY_NAMESPACE);
  return (
    <main
      aria-label={t("loading")}
      aria-busy="true"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)"
    >
      <SectionCard title={t("listTitle")} content="flush">
        <ul aria-hidden="true">
          <ListCardItemSkeleton hasTrailing />
          <ListCardItemSkeleton hasTrailing />
          <ListCardItemSkeleton hasTrailing isLast />
        </ul>
      </SectionCard>
      <SectionCard title={t("guideTitle")}>
        <div className="flex h-56 animate-pulse flex-col gap-(--space-4) rounded-(--radius-md) bg-(--component-list-card-item-skeleton)" />
      </SectionCard>
    </main>
  );
}
