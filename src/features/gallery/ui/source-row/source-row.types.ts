import type { PhotoSourceItem } from "../photo-sources-screen/photo-sources-screen.types";

export interface PhotoSourceRowProps {
  readonly source: PhotoSourceItem;
  readonly isLast: boolean;
}
