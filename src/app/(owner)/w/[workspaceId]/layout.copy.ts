// Source: copy-deck.md §1 "Owner navigation and shell" (Dashboard) and §4.3 (Title). Copied verbatim.
export const WORKSPACE_LAYOUT_COPY_NAMESPACE = "ownerWorkspaceLayout";

export const WORKSPACE_LAYOUT_COPY = {
  namespace: WORKSPACE_LAYOUT_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Dashboard",
    },
    id: {
      title: "Dasbor",
    },
  },
} as const;
