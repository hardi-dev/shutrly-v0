// Source: copy-deck.md §1 "Unread badge accessible text". Copied verbatim; the count is the ICU plural.
export const ICON_BUTTON_COPY_NAMESPACE = "iconButton";

export const ICON_BUTTON_COPY = {
  namespace: ICON_BUTTON_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      unreadBadge: "{count, plural, one {# unread notification} other {# unread notifications}}",
    },
    id: { unreadBadge: "{count, plural, other {# notifikasi belum dibaca}}" },
  },
} as const;
