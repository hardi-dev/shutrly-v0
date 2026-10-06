export const SELECTION_OWNER_COPY = {
  // owner-1 exports: the card and the page
  cardTitle: "Pilihan klien",
  pageMeta: "Lihat pilihan foto klien dan kunci setelah selesai.",
  cardNotPublished: "Klien memilih foto lewat galeri.",
  cardNotPublishedNote: "Klien baru bisa memilih setelah galeri dipublikasikan.",
  openGallery: "Buka galeri",
  cardNoItems: "Paket proyek ini tidak punya item pilihan foto.",
  cardOpen: "Pilihan per bagian paket.",
  cardReview: (count: number) =>
    count === 1
      ? "Klien sudah mengirim satu bagian."
      : `Klien sudah mengirim ${String(count)} bagian.`,
  cardFinal: "Pilihan sudah final.",
  viewPicks: "Lihat pilihan",
  reviewPicks: "Tinjau pilihan",
  status: { OPEN: "Terbuka", SUBMITTED: "Dikirim", LOCKED: "Dikunci" },
  usage: (usage: number, limit: number, unit: string) =>
    `${String(usage)} dari ${String(limit)} ${unit}`,
  usageOpen: (usage: number, limit: number, unit: string) =>
    `${String(usage)} dari ${String(limit)} ${unit} dipilih`,
  notes: (count: number) => `${String(count)} catatan`,
  sentOn: (date: string) => `dikirim ${date}`,
  metaJoin: " · ",
  waitingTitle: "Menunggu klien memilih",
  // not in Pencil: the export says the client opened the gallery, which isn't tracked
  waitingBody: "Klien belum mengirim pilihan.",
  sentBannerTitle: (names: string) => `${names} sudah dikirim klien`,
  sentBannerBody: "Periksa pilihan, lalu kunci agar tidak berubah.",
  namesJoin: " dan ",
  lockPicks: "Kunci pilihan",
  closePicks: "Tutup pilihan",
  moreThumbs: (count: number) => `+${String(count)}`,
  // owner-2 exports: the group page
  detailSubtitle: "Foto yang klien pilih.",
  copyNames: "Salin nama file",
  copiedTitle: "Daftar nama file disalin",
  copyFailedTitle: "Daftar belum tersalin",
  copyFailedBody: "Salin nama file secara manual.",
  openAlertTitle: "Klien masih bisa mengubah pilihan",
  openAlertBody: "Daftar ini bisa berubah sampai klien mengirim atau Anda menutup.",
  missingTitle: (count: number) => `${String(count)} foto pilihan tidak ada lagi di Drive`,
  missingBody: (names: string) =>
    `${names} tetap dihitung. Cari filenya di Drive atau kunci apa adanya.`,
  namesList: ", ",
  summaryTitle: "Ringkasan",
  summaryStatus: "Status",
  summaryUsed: "Terpakai",
  summaryTime: "Waktu",
  summaryNotes: "Catatan",
  notesPhotos: (count: number) => `${String(count)} foto bercatatan`,
  timeChanged: (when: string) => `Diubah ${when}`,
  timeSent: (when: string) => `Dikirim ${when}`,
  timeLocked: (when: string) => `Dikunci ${when}`,
  // not in Pencil: an open group with no picks yet
  timeNone: "Belum ada pilihan",
  picksTitle: "Foto pilihan",
  picksMetaCount: (picks: number, withNotes: number) =>
    withNotes === 0
      ? `${String(picks)} foto`
      : `${String(picks)} foto · ${String(withNotes)} dengan catatan`,
  picksMetaQuantity: (picks: number) =>
    `${String(picks)} foto · jumlah cetak tertulis di tiap foto`,
  clientNote: "Catatan klien",
  quantity: (quantity: number) => `× ${String(quantity)}`,
  missingOnPhone: "Hilang di Drive",
  folderSeparator: " › ",
  // not in Pencil: a group with no picks
  emptyTitle: "Belum ada foto dipilih",
  emptyBody: "Klien belum memilih foto untuk bagian ini.",
  // dialogs
  lockTitle: (name: string) => `Kunci pilihan ${name}?`,
  lockDescription: "Klien tidak bisa mengubahnya lagi.",
  lockBody:
    "Setelah dikunci, pilihan tidak bisa dibuka lagi dan add-on tidak bisa menambah batas grup ini.",
  closeTitle: (name: string) => `Tutup pilihan ${name}?`,
  closeDescription: "Grup dikunci dengan pilihan saat ini.",
  closeBody: (usage: number, unit: string) =>
    `Klien belum mengirim. Grup dikunci dengan ${String(usage)} ${unit} terpilih dan tidak bisa dibuka lagi.`,
  // not in Pencil: results of the lock
  lockedToast: (name: string) => `${name} dikunci`,
  closedToast: (name: string) => `${name} ditutup`,
  staleToast: "Status pilihan sudah berubah. Halaman dimuat ulang.",
  lockFailed: "Pilihan belum terkunci. Coba lagi.",
} as const;
