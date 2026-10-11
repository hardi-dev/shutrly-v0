// Source: copy-deck.md §1 "Shared photo and media controls". Copied verbatim.
export const MEDIA_VIEWER_COPY_NAMESPACE = "mediaViewer";

export const MEDIA_VIEWER_COPY = {
  namespace: MEDIA_VIEWER_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      label: "Preview {filename}",
      close: "Close",
      previous: "Previous photo",
      next: "Next photo",
      filmstrip: "Other photos",
    },
    id: {
      label: "Pratinjau {filename}",
      close: "Tutup",
      previous: "Foto sebelumnya",
      next: "Foto berikutnya",
      filmstrip: "Foto lainnya",
    },
  },
} as const;
