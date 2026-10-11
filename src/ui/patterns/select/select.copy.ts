// DECK GAP: copy-deck.md §1 has no row for the picker's confirm button "Pilih". en is the English
// counterpart of the existing Indonesian text; Owner to confirm.
export const SELECT_COPY_NAMESPACE = "select";

export const SELECT_COPY = {
  namespace: SELECT_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { pick: "Choose" },
    id: { pick: "Pilih" },
  },
} as const;
