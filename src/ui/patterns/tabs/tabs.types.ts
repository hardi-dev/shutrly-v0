export interface TabLink {
  readonly href: string;
  readonly label: string;
  readonly isActive: boolean;
}

export interface TabsProps {
  readonly label: string;
  readonly tabs: readonly TabLink[];
  readonly hasTrack?: boolean;
}
