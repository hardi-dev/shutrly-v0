import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";

// Source: copy-deck.md §1, "Route error title", "Route error body" and "Retry". Copied verbatim.
export const ERROR_COPY_NAMESPACE = "appError";

export const ERROR_COPY: CopyModule = {
  namespace: ERROR_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      title: "Something went wrong",
      body: "Try again in a moment.",
      retry: "Try again",
    },
    id: {
      title: "Ada kendala",
      body: "Coba lagi sebentar lagi.",
      retry: "Coba lagi",
    },
  },
};
