// Source: copy-deck.md §1 "Shared photo and media controls" (Missing badge, Missing accessible suffix).
// The accessible name adds the state as text, never colour alone (C46 › Accessibility).
export const PHOTO_TILE_COPY_NAMESPACE = "photoTile";

export const PHOTO_TILE_COPY = {
  namespace: PHOTO_TILE_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { missingBadge: "Missing", missingSuffix: "File missing" },
    id: { missingBadge: "Hilang", missingSuffix: "File hilang" },
  },
} as const;
