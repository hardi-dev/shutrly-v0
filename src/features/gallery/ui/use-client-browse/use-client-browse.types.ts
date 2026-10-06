import type { BrowseCursor } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { ClientBrowsePageView } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";

export interface ClientBrowseLocation {
  readonly sourceId: string | null;
  readonly path: string;
  readonly search: string;
  /** Display names of the opened folders, for the in-card breadcrumb. */
  readonly trail: readonly string[];
}

export interface ClientBrowseQuery {
  readonly kind: "PROOF";
  readonly sourceId: string | null;
  readonly path: string;
  readonly search: string;
  readonly cursor: BrowseCursor | null;
}

/** The browse server action; `SIGNED_OUT` once the session ended. */
export type ClientBrowseAction = (
  query: ClientBrowseQuery,
) => Promise<ClientBrowsePageView | { readonly kind: "SIGNED_OUT" }>;

export interface ClientBrowseState {
  readonly location: ClientBrowseLocation;
  readonly page: ClientBrowsePageView | null;
  readonly photos: readonly ClientPhotoView[];
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly hasFailed: boolean;
}

/** What `useClientBrowse` hands the screen. */
export interface ClientBrowseHandle {
  readonly state: ClientBrowseState;
  readonly searchText: string;
  readonly go: (location: ClientBrowseLocation) => Promise<void>;
  readonly loadMore: () => Promise<void>;
  readonly search: (text: string) => void;
}
