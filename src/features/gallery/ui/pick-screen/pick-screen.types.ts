import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type {
  OtherGroupPick,
  PickedPhotoView,
  PickGroupView,
  PickView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type {
  PickFilter,
  PickGridHandle,
  PickScreenActions,
  PickSelectionHandle,
} from "../use-pick-screen/use-pick-screen.types";

export interface PickScreenProps {
  readonly gate: ClientGateView;
  readonly token: string;
  readonly view: PickView;
  /** The first page of the flat grid, or null when it failed to load. */
  readonly initialPage: PickPhotosPage | null;
  readonly actions: PickScreenActions;
}

export interface PickTileProps {
  readonly photo: ClientPhotoView;
  readonly pick: PickedPhotoView | undefined;
  readonly others: readonly OtherGroupPick[];
  readonly group: PickGroupView;
  readonly isFull: boolean;
  readonly onToggle: (photo: ClientPhotoView, isSelected: boolean) => void;
  readonly onNote: (photoId: string) => void;
}

export interface PickGridProps {
  readonly filter: PickFilter;
  readonly selection: PickSelectionHandle;
  readonly grid: PickGridHandle;
  readonly onNote: (photoId: string) => void;
}

export interface PickFilterControlProps {
  readonly filter: PickFilter;
  readonly onChange: (filter: PickFilter) => void;
  readonly className?: string;
}

export interface PickSummaryProps {
  readonly selection: PickSelectionHandle;
  readonly reviewHref: string;
}

export interface PickPhotosCardProps {
  readonly selection: PickSelectionHandle;
  readonly grid: PickGridHandle;
  readonly onNote: (photoId: string) => void;
}
