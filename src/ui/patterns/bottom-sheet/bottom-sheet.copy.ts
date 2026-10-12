// Source: copy-deck.md §1 "Common actions and states" (Close dialog/sheet/viewer). Copied verbatim.
export const BOTTOM_SHEET_COPY_NAMESPACE = "bottomSheet";

export const BOTTOM_SHEET_COPY = {
  namespace: BOTTOM_SHEET_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { close: "Close" },
    id: { close: "Tutup" },
  },
} as const;
