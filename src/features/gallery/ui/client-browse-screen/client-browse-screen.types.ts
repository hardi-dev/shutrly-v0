import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";
import type { ClientGateView } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import type {
  ClientBrowseAction,
  ClientBrowseHandle,
  ClientBrowseState,
} from "../use-client-browse/use-client-browse.types";

export interface ClientBrowseScreenProps {
  readonly gate: ClientGateView;
  readonly token: string;
  /** False when the project skips Beranda (A-31): no breadcrumb parent, no back button. */
  readonly hasHome: boolean;
  /** The root page loaded by the server, or null when it failed. */
  readonly initialPage: ClientBrowsePageView | null;
  readonly browseAction: ClientBrowseAction;
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
