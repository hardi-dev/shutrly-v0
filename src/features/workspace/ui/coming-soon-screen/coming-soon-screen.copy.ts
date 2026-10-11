// Source: copy-deck.md §1 "Owner navigation and shell" (Coming-soon title, body and back). Copied verbatim.
export const COMING_SOON_COPY_NAMESPACE = "workspaceComingSoon";

export const COMING_SOON_COPY = {
  namespace: COMING_SOON_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Coming soon",
      body: "This feature isn’t available yet.",
      back: "Back to dashboard",
    },
    id: {
      title: "Segera hadir",
      body: "Fitur ini belum tersedia.",
      back: "Kembali ke dasbor",
    },
  },
} as const;
