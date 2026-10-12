import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";

// Source: copy-deck.md §17, "Global 404". Copied verbatim; the deck is the only source of this text.
export const NOT_FOUND_COPY_NAMESPACE = "appNotFound";

export const NOT_FOUND_COPY: CopyModule = {
  namespace: NOT_FOUND_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      code: "404",
      title: "Page not found",
      body: "This page isn’t available.",
      home: "Go to Shutrly",
    },
    id: {
      code: "404",
      title: "Halaman tidak ditemukan",
      body: "Halaman ini tidak tersedia.",
      home: "Ke Shutrly",
    },
  },
};
