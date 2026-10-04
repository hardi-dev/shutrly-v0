import type { PublishSourceFailure } from "@/features/gallery/application/use-cases/gallery-results/gallery-results.types";
import type { GalleryPageView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { GalleryAction } from "@/features/gallery/domain/gallery-status/gallery-header-actions";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryLifecycleProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly actions: GalleryPageActions;
}

export interface GalleryDialogsProps extends GalleryLifecycleProps {
  readonly open: GalleryAction | "REFUSED" | null;
  readonly failures: readonly PublishSourceFailure[];
  readonly onClose: () => void;
  readonly onRefused: (failures: readonly PublishSourceFailure[]) => void;
}

export interface GalleryHeaderControlsProps {
  readonly primary: GalleryAction | null;
  readonly menu: readonly GalleryAction[];
  readonly hasSources: boolean;
  readonly onChoose: (action: GalleryAction) => void;
}

export interface PrimaryButtonProps {
  readonly primary: GalleryAction;
  readonly hasSources: boolean;
  readonly onChoose: (action: GalleryAction) => void;
}
