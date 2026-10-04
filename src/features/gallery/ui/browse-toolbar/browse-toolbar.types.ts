import type { BrowsePageView } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos.types";

import type { BrowseLocation, Crumb } from "../browse-text/browse-text.types";

export interface BrowseToolbarProps {
  readonly location: BrowseLocation;
  readonly page: BrowsePageView | null;
  readonly crumbs: readonly Crumb[];
  readonly searchText: string;
  readonly onSearch: (text: string) => void;
  readonly onNavigate: (location: BrowseLocation) => void;
}

export type BrowseTrailProps = Omit<BrowseToolbarProps, "searchText" | "onSearch">;
