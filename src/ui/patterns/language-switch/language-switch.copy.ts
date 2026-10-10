// Source: copy-deck.md §1, "Language switch — proposed control" and "Switch failed". Copied verbatim.
export const LANGUAGE_SWITCH_COPY_NAMESPACE = "languageSwitch";

export const LANGUAGE_SWITCH_COPY = {
  namespace: LANGUAGE_SWITCH_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      failed: "Couldn’t change the language. Try again.",
      accessibleName: "Language",
      english: "English",
      indonesian: "Bahasa Indonesia",
      changing: "Changing language…",
    },
    id: {
      failed: "Bahasa belum diganti. Coba lagi.",
      accessibleName: "Bahasa",
      english: "English",
      indonesian: "Bahasa Indonesia",
      changing: "Mengganti bahasa…",
    },
  },
} as const;
