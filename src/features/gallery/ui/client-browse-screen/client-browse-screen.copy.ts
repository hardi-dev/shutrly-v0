export const CLIENT_BROWSE_COPY = {
  subtitle: "Lihat-lihat foto Anda. Buka foto untuk memilihnya ke bagian paket.",
  subtitleNoGroups: "Lihat semua foto Anda.",
  cardTitle: "Foto",
  cardMeta: (photos: number, folders: number) =>
    folders > 0 ? `${String(photos)} foto · ${String(folders)} folder` : `${String(photos)} foto`,
  folderMeta: (name: string, photos: number) => `${name} · ${String(photos)} foto`,
  searchMeta: (count: number) => `${String(count)} hasil`,
  searchPlaceholder: "Cari nama file",
  searchLabel: "Cari nama file",
  rootLabel: "Semua folder",
  rootSummary: (folders: number, photos: number) =>
    `Semua folder · ${String(folders)} folder, ${String(photos)} foto`,
  searchSummary: (count: number, text: string) => `${String(count)} foto cocok dengan “${text}”`,
  folderCount: (count: number) => `${String(count)} foto`,
  // not in Pencil
  folderFallbackName: "Folder",
  failedTitle: "Foto gagal dimuat",
  failedBody: "Periksa koneksi Anda, lalu coba lagi.",
  retry: "Coba lagi",
  unavailableTitle: "Foto belum bisa ditampilkan",
  unavailableBody: "Kami tidak bisa mengambil foto saat ini.",
  // not in Pencil
  emptyTitle: "Belum ada foto",
  // not in Pencil
  emptyBody: "Fotografer belum menambahkan foto di sini.",
  // not in Pencil
  searchEmptyTitle: (text: string) => `Tidak ada foto “${text}”`,
  // not in Pencil
  searchEmptyBody: "Coba nama file lain.",
  // not in Pencil
  loadingMore: "Memuat foto lainnya…",
  viewerMissing: "Foto ini tidak tersedia lagi",
} as const;
