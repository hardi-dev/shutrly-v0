// Source: The brand stays 'shutrly.' in both languages and the footer keeps the copyright (copy-deck.md §18: wordmark and copyright retain brand identity). The headline uses the §2.1 interim editorial headline; no other row covers it.
export const SPLIT_LAYOUT_COPY_NAMESPACE = "authSplitLayout";

export const SPLIT_LAYOUT_COPY = {
  namespace: SPLIT_LAYOUT_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      brand: "shutrly.",
      footer: "© 2026 Shutrly",
      headline: "Keep each shoot’s details together.",
    },
    id: {
      brand: "shutrly.",
      footer: "© 2026 Shutrly",
      headline: "Catat detail tiap pemotretan di satu tempat.",
    },
  },
} as const;
