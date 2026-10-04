export interface TabLink {
  readonly label: string;
  readonly isActive: boolean;
  /** A route tab; without it the tab is a button that calls `onPress` (in-page state, e.g. *Semua foto*). */
  readonly href?: string;
  readonly onPress?: () => void;
}

export interface TabsProps {
  readonly label: string;
  readonly tabs: readonly TabLink[];
  readonly hasTrack?: boolean;
}

export interface TabItemProps {
  readonly tab: TabLink;
}
