import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";

export const PLATFORM_COPY = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  X: "X",
  OTHER: "Lainnya",
} as const;
export const CLIENT_COPY = {
  listTitle: "Daftar klien",
  noWhatsapp: "Belum ada nomor WhatsApp",
  noSocialLinks: "—",
  tabsLabel: "Status klien",
  active: "Aktif",
  archived: "Arsip",
  add: "Tambah",
  addClient: "Tambah klien",
  emptyActiveTitle: "Belum ada klien aktif",
  emptyActiveBody:
    "Tambahkan orang yang memesan sesi foto, lalu pilih mereka saat membuat proyek.",
  emptyArchivedTitle: "Belum ada klien di arsip",
  emptyArchivedBody: "Klien yang kamu arsipkan muncul di sini dan bisa dipulihkan kapan saja.",
  count: (status: ClientStatus, count: number) =>
    `${String(count)} klien ${status === "ACTIVE" ? "aktif" : "diarsipkan"}`,
} as const;
