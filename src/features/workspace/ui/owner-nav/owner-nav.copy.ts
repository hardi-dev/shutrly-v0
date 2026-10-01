export const OWNER_NAV_COPY = {
  dashboard: "Dasbor",
  projects: "Proyek",
  clients: "Klien",
  invoices: "Invoice",
  services: "Layanan",
  team: "Tim",
  catalog: "KATALOG",
  messageTemplates: "Template pesan",
  photoSources: "Sumber foto",
  settings: "Pengaturan",
  create: "Proyek baru",
  search: "Pencarian",
  notifications: "Notifikasi",
  dashboardSubtitle: (workspaceName: string) => `Ringkasan workspace ${workspaceName}.`,
  settingsSubtitle: "Atur identitas brand, kontak, dan format invoice workspace ini.",
  messageTemplatesSubtitle:
    "Pesan WhatsApp untuk klien. Kamu tetap mengirimnya sendiri dari WhatsApp.",
  photoSourcesSubtitle:
    "Tempat foto gallery-mu disimpan. Shutrly hanya membaca, tidak pernah mengubah isinya.",
  comingSoonSubtitle: "Segera hadir.",
} as const;
