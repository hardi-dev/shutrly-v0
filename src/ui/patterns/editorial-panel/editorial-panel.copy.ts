// Source: copy-deck.md §2.1 interim editorial description. Copied verbatim.
export const EDITORIAL_PANEL_COPY_NAMESPACE = "authEditorialPanel";

export const EDITORIAL_PANEL_COPY = {
  namespace: EDITORIAL_PANEL_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      body: "Record the client’s package, agreed price and shoot schedule in one project.",
    },
    id: {
      body: "Catat paket klien, harga sepakat, dan jadwal pemotretan dalam satu proyek.",
    },
  },
} as const;
