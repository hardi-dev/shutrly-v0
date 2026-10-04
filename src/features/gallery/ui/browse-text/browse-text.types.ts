export interface BrowseLocation {
  readonly kind: "PROOF" | "EDITED" | "PRINT";
  /** The opened source; null at the top level. */
  readonly sourceId: string | null;
  readonly path: string;
  readonly search: string;
}

export interface Crumb {
  readonly label: string;
  /** Where the crumb leads; null for the current one. */
  readonly target: BrowseLocation | null;
}
