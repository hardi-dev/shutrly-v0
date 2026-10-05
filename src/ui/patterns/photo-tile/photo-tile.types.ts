export interface PhotoTileProps {
  readonly fileName: string;
  /** Folder path and kind, shown in search results. */
  readonly meta?: string;
  readonly imageSrc: string;
  /** Tried once when `imageSrc` fails to load; if that fails too the tile shows no image. */
  readonly fallbackSrc?: string;
  readonly isMissing?: boolean;
  /** Opens the Media Viewer; without it the tile is not interactive. */
  readonly onPress?: () => void;
}

export interface PhotoTileImageProps {
  readonly imageSrc: string;
  readonly fallbackSrc?: string;
  readonly isMissing: boolean;
}
