import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type {
  ClientBrowseAction,
  ClientBrowseHandle,
  ClientBrowseState,
} from "../use-client-browse/use-client-browse.types";
import type { PhotoTarget, ViewerPickActions } from "../use-pick-targets/use-pick-targets.types";

export interface ClientBrowseScreenProps {
  readonly gate: ClientGateView;
  readonly token: string;
  /** False when the project skips Beranda (A-31): no breadcrumb parent, no back button. */
  readonly hasHome: boolean;
  /** The root page loaded by the server, or null when it failed. */
  readonly initialPage: ClientBrowsePageView | null;
  readonly browseAction: ClientBrowseAction;
  /** The groups and picks behind the viewer's *Pilih untuk…*; no groups keeps it read-only (A-31). */
  readonly targets: PickTargets;
  readonly pickActions: ViewerPickActions;
}

export interface BrowseViewerProps {
  readonly photos: readonly ClientPhotoView[];
  readonly index: number | null;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
  readonly targets: PickTargets;
  readonly pickActions: ViewerPickActions;
}

export interface ClientBrowseCardProps {
  readonly state: ClientBrowseState;
  readonly searchText: string;
  readonly onSearch: (text: string) => void;
  readonly onRoot: () => void;
}

export interface SearchFieldProps extends Pick<ClientBrowseCardProps, "searchText" | "onSearch"> {
  readonly className: string;
}

export interface BrowseCardProps {
  readonly browse: ClientBrowseHandle;
  readonly onOpenPhoto: (index: number) => void;
}

/** The pick whose note the viewer's sheet edits (A-32). */
export interface NoteFor {
  readonly photo: ClientPhotoView;
  readonly target: PhotoTarget;
}
