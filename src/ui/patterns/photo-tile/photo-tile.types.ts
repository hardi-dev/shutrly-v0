/** The selectable variant (library *Photo Tile/Selectable*, F-10 D-21): the whole tile toggles. */
export interface PhotoTileSelection {
  readonly isSelected: boolean;
  /** E.g. the group is full and this photo isn't picked. */
  readonly isDisabled?: boolean;
  readonly onChange: (isSelected: boolean) => void;
}

/** A chip at the image's bottom-left: the own group's quantity (info) or another group's marker. */
export interface PhotoTileBadge {
  readonly label: string;
  readonly tone: "info" | "neutral";
}

/** The *Catatan* button over a picked photo (A-32). */
export interface PhotoTileNote {
  readonly hasNote: boolean;
  readonly label: string;
  readonly accessibleLabel: string;
  readonly onPress: () => void;
}

export interface PhotoTileProps {
  readonly fileName: string;
  /** Folder path and kind, shown in search results. */
  readonly meta?: string;
  readonly imageSrc: string;
  /** Tried once when `imageSrc` fails to load; if that fails too the tile shows no image. */
  readonly fallbackSrc?: string;
  readonly isMissing?: boolean;
  /** Opens the Media Viewer; without it the tile is not interactive. Ignored with `selection`. */
  readonly onPress?: () => void;
  readonly selection?: PhotoTileSelection;
  readonly badge?: PhotoTileBadge;
  readonly note?: PhotoTileNote;
}

export interface PhotoTileImageProps {
  readonly imageSrc: string;
  readonly fallbackSrc?: string;
  readonly isMissing: boolean;
  readonly badge?: PhotoTileBadge;
  readonly selection?: PhotoTileSelection;
}

export interface PhotoTileNoteButtonProps {
  readonly note: PhotoTileNote;
}

export interface SelectIndicatorProps {
  readonly selection: PhotoTileSelection;
}

export interface TileBadgeProps {
  readonly badge: PhotoTileBadge;
}
