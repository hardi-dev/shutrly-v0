// Source: copy-deck.md §1 "Common actions and states" (Notification region, Dismiss alert/toast). Copied verbatim.
export const TOAST_COPY_NAMESPACE = "toast";

export const TOAST_COPY = {
  namespace: TOAST_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { regionLabel: "Notifications", close: "Dismiss notification" },
    id: { regionLabel: "Notifikasi", close: "Tutup notifikasi" },
  },
} as const;
