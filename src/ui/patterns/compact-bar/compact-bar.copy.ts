// Source: copy-deck.md §1 "Common actions and states" (Back navigation) and "Owner navigation and
// shell" (Dashboard). Copied verbatim.
export const COMPACT_BAR_COPY_NAMESPACE = "compactBar";

export const COMPACT_BAR_COPY = {
  namespace: COMPACT_BAR_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { back: "Back", defaultParent: "Dashboard" },
    id: { back: "Kembali", defaultParent: "Dasbor" },
  },
} as const;
