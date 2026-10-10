// Source: copy-deck.md §1, "Switch failed". Copied verbatim.
export const LANGUAGE_SWITCH_COPY_NAMESPACE = "languageSwitch";

export const LANGUAGE_SWITCH_COPY = {
  namespace: LANGUAGE_SWITCH_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      failed: "Couldn’t change the language. Try again.",
    },
    id: {
      failed: "Bahasa belum diganti. Coba lagi.",
    },
  },
} as const;
