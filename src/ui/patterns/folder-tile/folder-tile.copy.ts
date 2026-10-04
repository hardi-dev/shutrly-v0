export const FOLDER_TILE_COPY = {
  // The tile's accessible name: "{folder}, {n} foto" (C47 › Accessibility).
  label: (name: string, countLabel: string) => `${name}, ${countLabel}`,
} as const;
