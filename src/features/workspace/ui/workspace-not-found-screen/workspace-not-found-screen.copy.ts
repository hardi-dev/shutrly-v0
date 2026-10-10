// Source: copy-deck.md §4.2 "Unavailable-workspace" rows. Copied verbatim.
export const WORKSPACE_NOT_FOUND_COPY_NAMESPACE = "workspaceNotFound";

export const WORKSPACE_NOT_FOUND_COPY = {
  namespace: WORKSPACE_NOT_FOUND_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Workspace not found",
      body: "This workspace isn’t available.",
      back: "Back to workspaces",
    },
    id: {
      title: "Ruang kerja tidak ditemukan",
      body: "Ruang kerja ini tidak tersedia.",
      back: "Kembali ke ruang kerja",
    },
  },
} as const;
