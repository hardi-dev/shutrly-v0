// DECK GAP: copy-deck.md §1 has no row for the decrease and increase step buttons. en is the
// English counterpart of the existing Indonesian text; Owner to confirm both locales.
export const STEPPER_COPY_NAMESPACE = "stepper";

export const STEPPER_COPY = {
  namespace: STEPPER_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { decrease: "Decrease", increase: "Increase" },
    id: { decrease: "Kurangi", increase: "Tambah" },
  },
} as const;
