export const REVIEW_COPY = {
  // tinjau exports
  title: (name: string) => `Tinjau ${name}`,
  subtitle: "Periksa pilihan Anda. Setelah dikirim, pilihan tidak bisa diubah.",
  // lihatpilihan-dikirim
  subtitleSubmitted: "Pilihan sudah dikirim dan menunggu fotografer. Pilihan tidak bisa diubah.",
  // not in Pencil: a group the photographer locked
  subtitleLocked: "Pilihan sudah dikunci fotografer. Pilihan tidak bisa diubah.",
  breadcrumbCurrent: "Tinjau",
  backToPick: "Kembali memilih",
  cardTitle: "Pilihan Anda",
  cardMetaCount: (picks: number) => `${String(picks)} foto`,
  cardMetaQuantity: (picks: number, usage: number, unit: string) =>
    `${String(picks)} foto · ${String(usage)} ${unit}. Atur jumlah cetak tiap foto.`,
  // not in Pencil: the read-only view of a print group
  cardMetaQuantityReadOnly: (picks: number, usage: number, unit: string) =>
    `${String(picks)} foto · ${String(usage)} ${unit}`,
  addMore: "Tambah foto lagi",
  send: (usage: number, unit: string) => `Kirim ${String(usage)} ${unit}`,
  sendEmpty: "Kirim",
  sending: "Mengirim…",
  emptyTitle: "Belum ada foto dipilih",
  // not in Pencil: the export's wording names the group's purpose ("yang ingin Anda edit")
  emptyBody: (name: string) => `Kembali ke ${name} dan ketuk foto untuk memilih.`,
  // not in Pencil: a picked photo that went missing, shown so it can be removed (A-8)
  missingMeta: "Foto tidak tersedia. Hapus dari pilihan Anda.",
  quantityReadOnly: (quantity: number) => `× ${String(quantity)}`,
  // beranda-setelah-kirim draws no toast; the plan asks for one
  sentToastTitle: (name: string) => `${name} dikirim`,
  sentToastBody: "Fotografer akan melihat pilihan Anda.",
  groupClosed: "Pilihan sudah dikirim",
  limitReached: "Batas pilihan tercapai",
  rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
  failed: "Pilihan belum tersimpan. Coba lagi.",
  sendFailed: "Pilihan belum terkirim. Coba lagi.",
  // tinjau-konfirmasi-kurang
  confirmTitle: (name: string) => `Kirim pilihan ${name}?`,
  confirmDescription: "Pilihan tidak bisa diubah setelah dikirim.",
  confirmBody: (usage: number, limit: number, unit: string, remaining: number) =>
    `Anda baru memilih ${String(usage)} dari ${String(limit)} ${unit}, jadi masih ada ${String(remaining)} tempat. Kirim sekarang atau pilih lagi?`,
  confirmBack: "Pilih lagi",
  // pick row
  noteTitle: "Catatan untuk fotografer",
  noteEdit: "Ubah catatan",
  noteAdd: "Tambah catatan",
  remove: (fileName: string) => `Hapus ${fileName}`,
  quantityLabel: (fileName: string) => `Jumlah ${fileName}`,
  folderSeparator: " › ",
} as const;
