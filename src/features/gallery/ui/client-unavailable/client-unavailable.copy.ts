// Source: copy-deck.md §14.1 "Generic unavailable title" and "Generic unavailable help". Copied verbatim.
export const CLIENT_UNAVAILABLE_COPY_NAMESPACE = "clientUnavailable";

export const CLIENT_UNAVAILABLE_COPY = {
  namespace: CLIENT_UNAVAILABLE_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      title: "This gallery isn’t available",
      body: "Contact your photographer for help.",
    },
    id: {
      title: "Galeri ini tidak tersedia",
      body: "Hubungi fotografermu untuk bantuan.",
    },
  },
} as const;
