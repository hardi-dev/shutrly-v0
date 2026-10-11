// Source: copy-deck.md §1 "Owner navigation and shell" and "Common actions and states". Copied verbatim.
export const SIDEBAR_COPY_NAMESPACE = "sidebar";

// The brand wordmark is a name, not copy, so it is not translated.
export const SIDEBAR_WORDMARK = "shutrly";

export const SIDEBAR_COPY = {
  namespace: SIDEBAR_COPY_NAMESPACE,
  surface: "shared",
  messages: {
    en: {
      label: "Sidebar navigation",
      navigationLabel: "Main navigation",
      collapse: "Collapse sidebar",
      expand: "Expand sidebar",
      logout: "Sign out",
    },
    id: {
      label: "Navigasi samping",
      navigationLabel: "Navigasi utama",
      collapse: "Ciutkan navigasi samping",
      expand: "Buka navigasi samping",
      logout: "Keluar",
    },
  },
} as const;
