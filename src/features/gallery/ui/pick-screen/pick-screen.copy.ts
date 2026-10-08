export const PICK_COPY = {
  // pilih-edit / pilih-cetak; the exports name the purpose ("untuk diedit"), which a
  // studio-defined item doesn't carry, so the line names the limit and unit only.
  subtitle: (limit: number, unit: string) => `Pilih hingga ${String(limit)} ${unit}.`,
  subtitleQuantity: (limit: number, unit: string) =>
    `Pilih hingga ${String(limit)} ${unit}. Atur jumlahnya di Tinjau.`,
  review: "Tinjau",
  cardTitle: "Foto",
  cardMeta: (total: number) => `${String(total)} foto · ketuk foto untuk memilih`,
  // not in Pencil: the segmented control's accessible name
  filterLabel: "Tampilkan foto",
  filterAll: "Semua foto",
  filterPicked: "Dipilih",
  limitTitle: "Batas pilihan tercapai",
  limitBody: (name: string, usage: number, limit: number) =>
    `${name} sudah ${String(usage)} dari ${String(limit)}. Lepas satu foto untuk memilih yang lain.`,
  quantity: (quantity: number) => `× ${String(quantity)}`,
  otherGroupQuantity: (name: string, quantity: number) => `${name} × ${String(quantity)}`,
  markerJoin: " · ",
  note: "Catatan",
  noteAdd: (fileName: string) => `Tambah catatan untuk ${fileName}`,
  noteEdit: (fileName: string) => `Ubah catatan untuk ${fileName}`,
  // not in Pencil: the Dipilih filter with no picks yet
  pickedEmptyTitle: "Belum ada foto dipilih",
  pickedEmptyBody: "Ketuk foto di Semua foto untuk memilih.",
  rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
  // not in Pencil: a refused pick never names the reason (TD › Error Handling)
  refused: "Foto ini tidak bisa dipilih.",
  // not in Pencil: the request failed, the pick was undone
  failed: "Pilihan belum tersimpan. Coba lagi.",
} as const;
