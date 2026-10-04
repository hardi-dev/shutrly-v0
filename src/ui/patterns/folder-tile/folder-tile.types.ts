export interface FolderTileProps {
  readonly name: string;
  /** The photo count for the active tab, e.g. *64 foto*. */
  readonly countLabel: string;
  readonly onPress: () => void;
}
