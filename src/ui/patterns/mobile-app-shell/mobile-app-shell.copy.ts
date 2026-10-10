// Source: copy-deck.md §1 "Owner navigation and shell" and "Common actions and states". Copied verbatim.
export const MOBILE_APP_SHELL_COPY_NAMESPACE = "mobileAppShell";

export const MOBILE_APP_SHELL_COPY = {
  namespace: MOBILE_APP_SHELL_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { skip: "Skip to content", search: "Search", notifications: "Notifications" },
    id: { skip: "Langsung ke konten", search: "Cari", notifications: "Notifikasi" },
  },
} as const;
