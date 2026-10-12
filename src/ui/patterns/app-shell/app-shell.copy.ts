// Source: copy-deck.md §1 "Owner navigation and shell" (Skip link, Navigation accessible name). Copied verbatim.
export const APP_SHELL_COPY_NAMESPACE = "appShell";
export { SIDEBAR_COPY_NAMESPACE } from "../sidebar/sidebar.copy";
export const APP_SHELL_COPY = {
  namespace: APP_SHELL_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: { skip: "Skip to content", tabletOverlay: "Main navigation" },
    id: { skip: "Langsung ke konten", tabletOverlay: "Navigasi utama" },
  },
} as const;
