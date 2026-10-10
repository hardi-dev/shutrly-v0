// Source: copy-deck.md §1 "Folder accessible name". The count comes in as the caller's countLabel
// (gallery copy, not yet converted), so the deck's "{folderName}, {count} photos" is composed here.
export const FOLDER_TILE_COPY_NAMESPACE = "folderTile";

export const FOLDER_TILE_COPY = {
  namespace: FOLDER_TILE_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { label: "{name}, {countLabel}" },
    id: { label: "{name}, {countLabel}" },
  },
} as const;
