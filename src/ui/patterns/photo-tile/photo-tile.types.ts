export interface PhotoTileProps {
  readonly fileName: string;
  /** Folder path and kind, shown in search results. */
  readonly meta?: string;
  readonly imageSrc: string;
  readonly isMissing?: boolean;
  /** Opens the Media Viewer; without it the tile is not interactive. */
  readonly onPress?: () => void;
}

export interface PhotoTileImageProps {
  readonly imageSrc: string;
  readonly isMissing: boolean;
}
