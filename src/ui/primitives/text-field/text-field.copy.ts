// Source: copy-deck.md §1 "Optional field suffix". Copied verbatim.
export const TEXT_FIELD_COPY_NAMESPACE = "textField";

export const TEXT_FIELD_COPY = {
  namespace: TEXT_FIELD_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { optionalSuffix: "(optional)" },
    id: { optionalSuffix: "(opsional)" },
  },
} as const;
