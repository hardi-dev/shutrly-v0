export const VIEWER_PICK_COPY = {
  pickFor: "Pilih untuk…",
  note: "Catatan",
  noteLabel: (fileName: string, groupName: string) => `Catatan untuk ${fileName} di ${groupName}`,
  usage: (usage: number, limit: number, unit: string) =>
    `${String(usage)} dari ${String(limit)} ${unit}`,
  hintOpen: "ketuk untuk memilih",
  hintPicked: "sudah dipilih",
  hintPickedQuantity: (quantity: number) => `sudah dipilih × ${String(quantity)}`,
  descriptionJoin: " · ",
  sheetMeta: (fileName: string) => `${fileName} · tersimpan otomatis`,
  sheetCount: (usage: number, limit: number) => `${String(usage)}/${String(limit)}`,
  pickedIn: (entries: string) => `Dipilih di: ${entries}`,
  pickedQuantity: (name: string, quantity: number) => `${name} × ${String(quantity)}`,
  pickedWithNote: (entry: string) => `${entry} · ada catatan`,
  entriesJoin: ", ",
  limitReached: "Batas pilihan tercapai",
  groupClosed: "Pilihan sudah dikirim",
  rateLimited: "Terlalu banyak perubahan, coba lagi sebentar.",
  // not in Pencil: a refused pick never names the reason (TD › Error Handling)
  refused: "Foto ini tidak bisa dipilih.",
  // not in Pencil: the request failed
  failed: "Pilihan belum tersimpan. Coba lagi.",
} as const;
