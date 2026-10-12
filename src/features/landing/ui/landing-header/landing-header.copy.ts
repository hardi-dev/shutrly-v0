// Source: copy-deck.md §19, the wordmark and launch-status rows. Copied verbatim. The wordmark is the
// brand name, the same in both languages.
export const LANDING_HEADER_COPY_NAMESPACE = "landingHeader";

export const LANDING_HEADER_COPY = {
  namespace: LANDING_HEADER_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      wordmark: "shutrly",
      comingSoon: "Coming soon",
    },
    id: {
      wordmark: "shutrly",
      comingSoon: "Segera hadir",
    },
  },
} as const;
