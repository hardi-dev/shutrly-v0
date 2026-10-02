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
  count: (status: ClientStatus, count: number) =>
    `${String(count)} klien ${status === "ACTIVE" ? "aktif" : "diarsipkan"}`,
} as const;
