import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";

const SOURCE_ROWS = 2;
const TILES = 8;
// C46: the tile image height is a literal per grid, 104 on phones and 220 on desktop (photo-tile.md › Gaps).

/** The gallery page while loading (`K5PgU` / `umIa6`, C-007): skeleton source rows and photo tiles. */
export function GalleryPageSkeleton() {
  return (
    <main
      aria-busy="true"
      data-testid="gallery-page-skeleton"
      className="mx-auto flex w-full max-w-(--size-content-max) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)"
    >
      <SectionCard title={GALLERY_COPY.sourcesTitle} content="flush">
        <ul>
          {Array.from({ length: SOURCE_ROWS }, (_, index) => (
            <ListCardItemSkeleton key={index} isLast={index === SOURCE_ROWS - 1} hasTrailing />
          ))}
        </ul>
      </SectionCard>
      <SectionCard title={GALLERY_COPY.photosTitle}>
        <div className="grid grid-cols-3 gap-(--space-3) md:grid-cols-4 md:gap-x-(--space-4) md:gap-y-(--space-5)">
          {Array.from({ length: TILES }, (_, index) => (
            <div key={index} className="flex flex-col gap-(--component-photo-tile-gap)">
              <div className="h-[104px] rounded-(--component-photo-tile-image-radius) bg-(--component-photo-tile-image-background) md:h-[220px]" />
              <div className="h-(--space-3) w-3/5 rounded-(--component-photo-tile-image-radius) bg-(--component-photo-tile-image-background)" />
            </div>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
