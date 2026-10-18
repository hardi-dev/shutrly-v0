import "server-only";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import { canShareGallery } from "@/features/gallery/domain/gallery-state/gallery-state";

/**
 * Tells whether a project's gallery card allows *Kirim link ke klien* (BR-GAL-010, AC-GFL-013, 020). The project
 * menu and the page composition use it; list and dashboard rows never pass it (A-11).
 * @param card - the project's gallery card view
 * @returns true when the gallery exists and the share is allowed
 */
export function isGalleryShareable(card: GalleryCardView): boolean {
  if (card.gallery === null) return false;
  return canShareGallery({
    projectStatus: card.project.status,
    state: card.gallery.state,
    activeSourceCount: card.gallery.activeSourceCount,
  });
}
