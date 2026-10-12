// Source: copy-deck.md §4.1 "First workspace" and §1 "Sign out". Copied verbatim.
// DECK GAP: previewBrand (the shutrly. wordmark), previewWorkspace (the sample name on the
// preview card) and separator (the dot between the identity and sign out) have no deck row.
// They keep the same text in both languages; no English is invented.
export const ONBOARDING_COPY_NAMESPACE = "workspaceOnboarding";

export const ONBOARDING_COPY = {
  namespace: ONBOARDING_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Set up your first workspace",
      description: "Create a workspace for this brand’s clients and projects. Start with its name.",
      nameLabel: "Workspace name",
      namePlaceholder: "e.g. Aster Wedding",
      submit: "Create workspace",
      previewBrand: "shutrly.",
      previewWorkspace: "Aster Wedding",
      previewDashboard: "Dashboard",
      benefitsLabel: "What’s included",
      separationTitle: "Separate records for each brand",
      separationBody:
        "Keep this brand’s client and project records separate from your other brands.",
      prefixTitle: "Invoice prefix: {prefix}",
      prefixBody: "Created from the name. You can change it in workspace settings.",
      currencyTitle: "Indonesian rupiah (IDR)",
      currencyBody: "The currency used in this workspace.",
      signedIn: "Signed in as",
      account: "{name} · {email}",
      signOut: "Sign out",
      separator: "·",
    },
    id: {
      title: "Siapkan ruang kerja pertamamu",
      description: "Buat ruang kerja untuk klien dan proyek merek ini. Mulai dari namanya.",
      nameLabel: "Nama ruang kerja",
      namePlaceholder: "Contoh: Aster Wedding",
      submit: "Buat ruang kerja",
      previewBrand: "shutrly.",
      previewWorkspace: "Aster Wedding",
      previewDashboard: "Dasbor",
      benefitsLabel: "Yang kamu dapatkan",
      separationTitle: "Catatan terpisah untuk tiap merek",
      separationBody: "Pisahkan catatan klien dan proyek merek ini dari merekmu yang lain.",
      prefixTitle: "Awalan nomor tagihan: {prefix}",
      prefixBody: "Dibuat dari nama. Bisa diubah di pengaturan ruang kerja.",
      currencyTitle: "Rupiah Indonesia (IDR)",
      currencyBody: "Mata uang yang dipakai di ruang kerja ini.",
      signedIn: "Masuk sebagai",
      account: "{name} · {email}",
      signOut: "Keluar",
      separator: "·",
    },
  },
} as const;
