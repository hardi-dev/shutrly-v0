import type { ReactNode } from "react";

import type { useViewerNavigation } from "./use-viewer-navigation";

export interface MediaViewerItem {
  readonly id: string;
  /** The file name: the top-bar title and the image's alt text. */
  readonly title: string;
  readonly meta: string;
  /** A missing file shows `missingText` instead of the image. */
  readonly isMissing?: boolean;
}

export interface MediaViewerProps {
  readonly items: readonly MediaViewerItem[];
  /** The open item; null closes the viewer. */
  readonly index: number | null;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
  readonly imageSrc: (item: MediaViewerItem, size: "stage" | "thumb") => string;
  /** Tried once when `imageSrc` fails to load; if that fails too the item reads as missing. */
  readonly imageFallbackSrc?: (
    item: MediaViewerItem,
    size: "stage" | "thumb",
  ) => string | undefined;
  readonly missingText: string;
  /** A second line under `missingText`, e.g. what happens to the photo meanwhile. */
  readonly missingNote?: string;
  /** The Owner's (or client's) actions for the current item, e.g. *Buka di Google Drive*. */
  readonly renderActions?: (item: MediaViewerItem) => ReactNode;
  /** A bar above the filmstrip for the current item, e.g. the client's pick bar on phones (F-10). */
  readonly renderFooter?: (item: MediaViewerItem) => ReactNode;
}

export interface ViewerFrameProps extends MediaViewerProps {
  readonly index: number;
}

export interface StageProps {
  readonly item: MediaViewerItem;
  readonly src: string;
  readonly fallbackSrc?: string;
  readonly missingText: string;
  readonly missingNote?: string;
}

export interface FilmstripProps {
  readonly items: readonly MediaViewerItem[];
  readonly index: number;
  readonly imageSrc: MediaViewerProps["imageSrc"];
  readonly imageFallbackSrc: MediaViewerProps["imageFallbackSrc"];
  readonly onIndexChange: (index: number) => void;
}

export interface FilmstripThumbProps {
  readonly item: MediaViewerItem;
  readonly position: number;
  readonly isActive: boolean;
  readonly src: string;
  readonly fallbackSrc?: string;
  readonly onSelect: (position: number) => void;
}

export interface TopBarProps {
  readonly item: MediaViewerItem;
  readonly renderActions: MediaViewerProps["renderActions"];
  readonly onClose: () => void;
}

export interface ArrowsProps {
  readonly index: number;
  readonly count: number;
  readonly nav: ReturnType<typeof useViewerNavigation>;
}
