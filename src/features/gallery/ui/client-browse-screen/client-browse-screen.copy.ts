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
  // F-19 (Owner 2026-10-07): built without a Pencil frame (Owner override); sync Pencil afterwards.
  download: "Unduh",
  downloadAll: "Unduh semua",
  downloadMenu: "Pilihan unduhan",
  pickSeveral: "Pilih beberapa",
  selectedTitle: (count: number) => `${String(count)} foto dipilih`,
  downloadSelected: (count: number) => `Unduh ${String(count)} foto`,
  cancel: "Batal",
  pickFor: "Masukkan ke…",
  pickPhotos: "Pilih foto",
  pickedTitle: (count: number, group: string) =>
    count === 0
      ? `Semua foto sudah ada di ${group}`
      : `${String(count)} foto dipilih untuk ${group}`,
  pickLimitTitle: "Pilihan melebihi batas",
  pickLimitBody: (remaining: number) =>
    `Sisa ${String(remaining)} foto di bagian ini. Kurangi foto yang dipilih, lalu coba lagi.`,
  pickClosed: "Pilihan bagian ini sudah dikirim",
  pickRefused: "Foto belum bisa dipilih. Coba lagi.",
  progressTitle: "Mengunduh foto",
  confirmTitle: (count: number) => `Unduh semua ${String(count)} foto?`,
  tileDownload: (fileName: string) => `Unduh ${fileName}`,
  downloadPhoto: "Unduh foto",
} as const;
