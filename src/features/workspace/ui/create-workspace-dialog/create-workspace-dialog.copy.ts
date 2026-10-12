// Source: copy-deck.md §4.2 "Workspace creation and switching", §4.1 "Main CTA" and §1 "Cancel dialog". Copied verbatim.
export const CREATE_WORKSPACE_COPY_NAMESPACE = "workspaceCreate";

export const CREATE_WORKSPACE_COPY = {
  namespace: CREATE_WORKSPACE_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Create workspace",
      description: "Create a separate workspace for another brand’s clients and projects.",
      label: "Workspace name",
      placeholder: "e.g. Aster Family",
      helper: "The invoice prefix comes from the name. You can change it later.",
      cancel: "Cancel",
      submit: "Create workspace",
    },
    id: {
      title: "Buat ruang kerja",
      description: "Buat ruang kerja terpisah untuk klien dan proyek merek lain.",
      label: "Nama ruang kerja",
      placeholder: "Contoh: Aster Family",
      helper: "Awalan nomor tagihan dibuat dari nama. Bisa diubah nanti.",
      cancel: "Batal",
      submit: "Buat ruang kerja",
    },
  },
} as const;
