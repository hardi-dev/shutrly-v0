// label: copy-deck.md §1 owner shell "Settings". DECK GAP: no row for the demo trigger text; en is
// an English counterpart of the Indonesian story text. The copy is used by the story only.
export const TOOLTIP_COPY_NAMESPACE = "tooltip";

export const TOOLTIP_COPY = {
  namespace: TOOLTIP_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { label: "Settings", trigger: "Focus or hover me" },
    id: { label: "Pengaturan", trigger: "Fokus atau arahkan ke saya" },
  },
} as const;
