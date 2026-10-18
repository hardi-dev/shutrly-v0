import type { GalleryPageView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { GalleryAction } from "@/features/gallery/domain/gallery-state/gallery-header-actions";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryLifecycleProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly actions: GalleryPageActions;
}

export interface GalleryDialogsProps extends GalleryLifecycleProps {
  readonly open: GalleryAction | null;
  readonly onClose: () => void;
}

export interface GalleryHeaderControlsProps {
  readonly primary: GalleryAction | null;
  readonly menu: readonly GalleryAction[];
  /** The phone menu sheet's meta line: the gallery state and the project. */
  readonly menuMeta: string;
  readonly onChoose: (action: GalleryAction) => void;
}

export interface PrimaryButtonProps {
  readonly primary: GalleryAction;
  readonly onChoose: (action: GalleryAction) => void;
}
