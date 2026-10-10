// Source: copy-deck.md §4.3 "Dashboard" rows. Copied verbatim.
export const DASHBOARD_COPY_NAMESPACE = "workspaceDashboard";

export const DASHBOARD_COPY = {
  namespace: DASHBOARD_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      greeting: "Welcome to {workspaceName}",
      created: "Workspace created",
      subtitle: "Use the navigation to open your projects, clients or services.",
      emptyTitle: "Set up this workspace’s brand details",
      emptyBody: "Open settings to add the brand name, contact details and invoice prefix.",
      settings: "Set up branding",
    },
    id: {
      greeting: "Selamat datang di {workspaceName}",
      created: "Ruang kerja dibuat",
      subtitle: "Buka proyek, klien, atau layanan lewat navigasi.",
      emptyTitle: "Lengkapi identitas merek ruang kerja ini",
      emptyBody: "Buka pengaturan untuk melengkapi nama merek, kontak, dan awalan nomor tagihan.",
      settings: "Lengkapi identitas merek",
    },
  },
} as const;
