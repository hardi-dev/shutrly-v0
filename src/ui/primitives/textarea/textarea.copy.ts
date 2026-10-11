// Source: copy-deck.md §1 "Optional field suffix". The textarea now shows the same suffix as the
// text field; it used to show a bare "Opsional" (visible change, Owner to confirm).
export const TEXTAREA_COPY_NAMESPACE = "textarea";

export const TEXTAREA_COPY = {
  namespace: TEXTAREA_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { optional: "(optional)" },
    id: { optional: "(opsional)" },
  },
} as const;
