import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { SOURCE_COPY } from "../source-copy/source-copy.copy";

export function PhotoSourcesSkeleton() {
  return (
    <main
      aria-label={SOURCE_COPY.loading}
      aria-busy="true"
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)"
    >
      <SectionCard title={SOURCE_COPY.listTitle} content="flush">
        <ul aria-hidden="true">
          <ListCardItemSkeleton hasTrailing />
          <ListCardItemSkeleton hasTrailing />
          <ListCardItemSkeleton hasTrailing isLast />
        </ul>
      </SectionCard>
      <SectionCard title={SOURCE_COPY.guideTitle}>
        <div className="flex h-56 animate-pulse flex-col gap-(--space-4) rounded-(--radius-md) bg-(--component-list-card-item-skeleton)" />
      </SectionCard>
    </main>
  );
}
