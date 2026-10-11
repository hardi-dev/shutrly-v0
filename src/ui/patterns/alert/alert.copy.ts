// Source: copy-deck.md §1 "Dismiss alert/toast". Copied verbatim.
export const ALERT_COPY_NAMESPACE = "alert";

export const ALERT_COPY = {
  namespace: ALERT_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { close: "Dismiss notification" },
    id: { close: "Tutup notifikasi" },
  },
} as const;
