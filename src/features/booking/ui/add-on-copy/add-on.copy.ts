// Add-on card, dialogs and menu (owner-3-addon exports, F-10 Slice 7).
export const ADD_ON_COPY = {
  cardTitle: "Add-on",
  cardDescription: "Tambahan yang klien minta.",
  add: "Tambah add-on",
  empty: "Belum ada add-on. Tambahkan saat klien minta foto atau layanan ekstra.",
  lockedNote: (names: string) =>
    `${names} sudah dikunci, jadi add-on tidak bisa menambah batasnya. Add-on tanpa grup tetap bisa dibuat.`,
  noGroup: "Tanpa grup",
  meta: (group: string, quantity: number, unitPrice: string, total: string) =>
    `${group} · ${String(quantity)} × ${unitPrice} = ${total}`,
  status: { DRAFT: "Draf", APPROVED: "Disetujui", CANCELLED: "Dibatalkan" },
  // not in Pencil: the row trigger isn't drawn (menu exports only)
  actionsLabel: (description: string) => `Aksi ${description}`,
  approve: "Setujui",
  deleteDraft: "Hapus draf",
  cancelAddOn: "Batalkan add-on",
  sheetMeta: (status: string, total: string) => `${status} · ${total}`,
  formTitle: "Tambah add-on",
  formDescription: "Add-on menambah batas pilihan klien setelah disetujui.",
  descriptionLabel: "Deskripsi",
  descriptionPlaceholder: "Contoh: Tambahan 5 foto edit",
  descriptionHelper: "Tampil di daftar add-on, tidak untuk klien.",
  // The export's field is named "Tambah ke grup"; its label and helper were left as the stock
  // "Layanan" text (design drift reported in the Slice 7 record).
  targetLabel: "Tambah ke grup",
  // not in Pencil: helper for the target select
  targetHelper: "Batas grup ini naik setelah add-on disetujui.",
  quantityLabel: "Jumlah",
  quantityHelper: "Bilangan bulat.",
  priceLabel: "Harga satuan",
  pricePrefix: "Rp",
  priceHelper: "Rupiah penuh.",
  totalLabel: "Total",
  formCancel: "Batal",
  saveDraft: "Simpan draf",
  // not in Pencil: toasts after each action
  draftSavedTitle: "Draf add-on disimpan",
  approvedTitle: "Add-on disetujui",
  cancelledTitle: "Add-on dibatalkan",
  deletedTitle: "Draf add-on dihapus",
  projectStatusTitle: "Proyek ini tidak bisa diberi add-on.",
  addOnStatusTitle: "Add-on ini sudah berubah. Muat ulang halaman.",
  targetLockedTitle: "Grup sudah dikunci, add-on tidak bisa disetujui.",
  failedTitle: "Gagal menyimpan. Coba lagi.",
  approveTitle: "Setujui add-on?",
  approveDescription: (description: string, total: string) => `${description} · ${total}`,
  approveLimit: (group: string, from: number, to: number) =>
    `Batas ${group} naik dari ${String(from)} menjadi ${String(to)}.`,
  approveReopen: (group: string) =>
    `Pilihan ${group} yang sudah dikirim dibuka lagi supaya klien bisa menambah foto dan mengirim ulang.`,
  approveNoInvoice: "Belum ada invoice dibuat.",
  approveConfirm: "Setujui add-on",
  cancelTitle: "Batalkan add-on?",
  cancelDescription: (description: string, date: string) => `${description} · disetujui ${date}`,
  cancelLimit: (group: string, from: number, to: number, unit: string) =>
    `Batas ${group} turun dari ${String(from)} menjadi ${String(to)}. Pembatalan ditolak jika klien sudah memilih lebih dari ${String(to)} ${unit}.`,
  // not in Pencil: cancelling an add-on without a target
  cancelNoGroup: "Add-on ini tidak mengubah batas pilihan klien.",
  cancelBack: "Kembali",
  cancelConfirm: "Batalkan add-on",
  refusedTitle: "Add-on belum bisa dibatalkan",
  refusedDescription: "Batas akan lebih kecil dari pilihan klien.",
  refusedBody: (usage: number, unit: string, limit: number) =>
    `Klien sudah memilih ${String(usage)} ${unit}. Jika add-on ini dibatalkan, batas turun menjadi ${String(limit)}. Minta klien melepas foto lebih dulu.`,
  refusedConfirm: "Mengerti",
  defaultUnit: "foto",
} as const;

export const ADD_ON_FIELD_ERRORS: Readonly<
  Partial<Record<string, Readonly<Partial<Record<string, string>>>>>
> = {
  description: {
    EMPTY: "Deskripsi wajib diisi.",
    // not in Pencil
    TOO_LONG: "Deskripsi maksimal 100 karakter.",
  },
  quantity: {
    TOO_SMALL: "Jumlah minimal 1.",
    // not in Pencil: the rest of this field's messages
    EMPTY: "Jumlah minimal 1.",
    NOT_WHOLE: "Jumlah harus bilangan bulat.",
    TOO_LARGE: "Jumlah maksimal 9.999.",
    INVALID: "Isi angka yang valid.",
  },
  // not in Pencil: price and target messages follow the project form's wording
  unitPrice: {
    EMPTY: "Isi harga satuan.",
    NEGATIVE: "Harga tidak boleh negatif.",
    NOT_WHOLE: "Harga dalam rupiah bulat, tanpa koma.",
    TOO_LARGE: "Total maksimal Rp 999.999.999.999.",
    INVALID: "Isi harga yang valid.",
  },
  selectionGroupId: {
    TARGET_LOCKED: "Grup ini sudah dikunci. Pilih grup lain atau tanpa grup.",
    NOT_AN_OPTION: "Pilih grup dari daftar.",
  },
};
