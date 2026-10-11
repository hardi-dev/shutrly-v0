// Source: copy-deck.md §19, the rotating headline rows. Copied verbatim. The three words rotate in
// this order; each word is its own key because a message cannot hold a list.
export const ROTATING_HEADLINE_COPY_NAMESPACE = "landingRotatingHeadline";

export const ROTATING_HEADLINE_COPY = {
  namespace: ROTATING_HEADLINE_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      prefix: "Less",
      wordBusywork: "busywork.",
      wordPaperwork: "paperwork.",
      wordBackAndForth: "back-and-forth.",
      stable: "More photography.",
      accessible: "Less busywork. More photography.",
    },
    id: {
      prefix: "Lebih sedikit",
      wordBusywork: "kerja admin.",
      wordPaperwork: "urusan kertas.",
      wordBackAndForth: "bolak-balik.",
      stable: "Lebih banyak waktu untuk fotografi.",
      accessible: "Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi.",
    },
  },
} as const;
