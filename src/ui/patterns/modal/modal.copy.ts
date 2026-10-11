// Source: copy-deck.md §1 "Close dialog/sheet/viewer". Copied verbatim. The demo copy lives in
// modal.stories.copy.ts.
export const MODAL_COPY_NAMESPACE = "modal";

export const MODAL_COPY = {
  namespace: MODAL_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { close: "Close" },
    id: { close: "Tutup" },
  },
} as const;
