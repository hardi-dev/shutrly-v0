// F-09 gallery copy (design.md › Copy). Indonesian UI copy; `// not in Pencil` marks undrawn text.
export const GALLERY_COPY = {
  cardTitle: "Galeri",
  cardDescription: "Foto proyek dari folder Google Drive kamu.",
  cardEmptyTitle: "Belum ada galeri",
  cardEmptyBody:
    "Buat galeri berpassword, lalu tautkan folder Google Drive berisi foto proyek ini.",
  cardDraftProjectTitle: "Galeri tersedia setelah booking",
  cardDraftProjectBody: "Konfirmasi booking dulu, lalu buat galeri untuk proyek ini.",
  // not in Pencil: a cancelled project without a gallery.
  cardCancelledTitle: "Galeri tidak tersedia",
  cardCancelledBody: "Proyek ini dibatalkan, jadi galeri tidak bisa dibuat.",
  create: "Buat galeri",
  manage: "Kelola galeri",
  manageMobile: "Kelola",
  view: "Lihat galeri",
  factStatus: "Status",
  factPassword: "Password",
  factSources: "Sumber",
  factPhotos: "Foto",
  factSourcesPhotos: "Sumber · Foto",
  factExpiry: "Kedaluwarsa",
  copyPassword: "Salin password",
  copiedTitle: "Password disalin",
  // not in Pencil: the clipboard was refused by the browser.
  copyFailedTitle: "Password belum tersalin",
  copyFailedBody: "Salin password secara manual.",
  sourceCount: (count: number) => `${String(count)} folder`,
  noSources: "Belum ada folder",
  photoCounts: (proof: number, edited: number, print: number) =>
    `${String(proof)} proof · ${String(edited)} edited · ${String(print)} print`,
  missingSuffix: (count: number) => ` (${String(count)} hilang)`,
  expiryNone: "Tidak ada",
  expiryNoneMeta: "Tanpa kedaluwarsa",
  // not in Pencil: a draft's duration before publishing.
  expiryDays: (days: number) => `${String(days)} hari setelah dipublikasikan`,
  expiryOn: (date: string) => `Kedaluwarsa ${date}`,
  expiredSince: (date: string) => `Kedaluwarsa sejak ${date}`,
  proofCount: (count: number) => `${String(count)} proof`,
  status: {
    DRAFT: "Draf",
    PUBLISHED: "Dipublikasikan",
    EXPIRED: "Kedaluwarsa",
    ARCHIVED: "Diarsipkan",
  },
  pageTitle: "Galeri",
  createDialogTitle: "Buat galeri",
  accessDescription:
    "Klien membuka galeri dengan link proyek dan password ini. Password terisi otomatis saat kamu membagikan galeri.",
  passwordLabel: "Password galeri",
  passwordHelper:
    "Dibuat otomatis, mudah diketik klien. Boleh diganti (6–64 karakter). Selalu bisa dilihat di halaman galeri.",
  regenerate: "Buat ulang",
  expiryLabel: "Kedaluwarsa",
  expiryOptionNone: "Tidak ada kedaluwarsa",
  expiryOptionDate: "Sampai tanggal",
  expiryOptionDays: "Selama beberapa hari",
  expiryDateLabel: "Tanggal kedaluwarsa",
  expiryDateHelper: "Galeri kedaluwarsa di akhir hari itu. Bisa diubah nanti.",
  expiryDaysLabel: "Jumlah hari",
  expiryDaysHelperDraft: "Dihitung dari saat galeri dipublikasikan. Bisa diubah nanti.",
  cancel: "Batal",
  createdTitle: "Galeri dibuat",
  createdBody: "Tambahkan folder Google Drive untuk mulai.",
  errors: {
    TOO_SHORT: "Password minimal 6 karakter.",
    TOO_LONG: "Password maksimal 64 karakter.", // not in Pencil
    REQUIRED: "Wajib diisi.", // not in Pencil
    INVALID: "Isian belum benar.", // not in Pencil
    NOT_WHOLE: "Isi dengan angka bulat.", // not in Pencil
    OUT_OF_RANGE: "Isi antara 1 dan 3650 hari.", // not in Pencil
    PAST_DATE: "Pilih tanggal hari ini atau sesudahnya.",
    NOT_DRIVE: "Tempel link folder Google Drive.", // not in Pencil
    NOT_A_FOLDER: "Ini link file. Tempel link folder Google Drive.",
    FOLDER_ALREADY_LINKED: "Folder ini sudah ada di galeri ini.",
    SOURCE_NOT_ACTIVE: "Sumber ini tidak aktif lagi. Pilih sumber lain.", // not in Pencil
  },
  // not in Pencil: TOO_LONG on the folder form's fields (A-3).
  fieldTooLong: {
    label: "Label maksimal 60 karakter.",
    link: "Link terlalu panjang.",
  },
  // not in Pencil: domain refusals shown as toasts.
  refused: {
    NOT_ALLOWED_FOR_PROJECT: "Galeri hanya bisa dibuat untuk proyek yang sudah dibooking.",
    ALREADY_EXISTS: "Proyek ini sudah punya galeri.",
    INVALID_STATE: "Galeri sudah berubah. Muat ulang halaman.",
    LAST_ACTIVE_SOURCE: "Galeri yang dipublikasikan butuh minimal satu folder aktif.",
    SYNC_IN_PROGRESS: "Folder ini sedang disinkronkan.",
    RATE_LIMITED: "Terlalu banyak sinkronisasi. Coba lagi sebentar lagi.",
  },
  saveFailedTitle: "Belum tersimpan", // not in Pencil
  saveFailedBody: "Periksa koneksi, lalu coba lagi.", // not in Pencil
  retry: "Coba lagi",
  sourcesTitle: "Sumber foto",
  sourcesDescription: "Folder Google Drive yang dibagikan sebagai “Siapa saja yang memiliki link”.",
  sourcesEmptyTitle: "Belum ada folder",
  sourcesEmptyBody:
    "Tautkan folder Google Drive berisi foto proyek ini. Foto di folder utama menjadi proof; subfolder edited dan print untuk hasil akhir.",
  sourcesEmptyBodyMobile: "Tautkan folder Google Drive berisi foto proyek ini.",
  addFolder: "Tambah folder",
  addFolderMobile: "Tambah",
  photosTitle: "Foto",
  photosDescriptionEmpty: "Ditemukan saat sinkronisasi. Urut nama file.",
  photosDescriptionMobile: "Urut nama file.",
  photosEmptyTitle: "Belum ada foto",
  photosEmptyBody: "Foto muncul di sini setelah folder disinkronkan.",
  accessTitle: "Akses klien",
  rotatePassword: "Ganti password",
  rotatePasswordMobile: "Ganti",
  publish: "Publikasikan",
  galleryMenu: "Menu galeri",
  syncAll: "Sinkronkan semua",
  syncAllRunning: "Menyinkronkan…",
  sync: "Sinkronkan",
  sourceMenu: (name: string) => `Menu ${name}`,
  sourceFallbackName: "Folder Google Drive", // not in Pencil: before the first sync reads the name
  sourceChip: {
    SUCCEEDED: "Berhasil",
    SYNCING: "Menyinkronkan",
    FAILED: "Gagal",
    NEVER: "Belum disinkronkan", // not in Pencil
    REMOVED: "Dilepas",
    ARCHIVED: "Arsip",
  },
  sourceSyncing: "Menyinkronkan…",
  sourceQueued: "Menunggu giliran…",
  sourceNever: "Belum disinkronkan", // not in Pencil
  sourceSyncedAt: (when: string) => `Disinkronkan ${when}`,
  sourceLastSyncedAt: (when: string) => `Terakhir disinkronkan ${when}`,
  sourceProof: (count: number) => `${String(count)} proof`,
  sourceMissing: (count: number) => `${String(count)} hilang`,
  sourceEdited: (count: number) => `${String(count)} edited`,
  sourcePrint: (count: number) => `${String(count)} print`,
  sourceIgnored: (count: number) => `${String(count)} diabaikan`,
  sourceTooDeep: (count: number) => `${String(count)} folder terlalu dalam`,
  syncError: {
    NOT_PUBLIC:
      "Folder tidak bisa dibaca. Bagikan folder sebagai “Siapa saja yang memiliki link”, lalu sinkronkan lagi.",
    RATE_LIMITED: "Google Drive sedang sibuk. Foto yang ada tidak berubah. Coba lagi nanti.", // not in Pencil
    UNAVAILABLE:
      "Google Drive sedang tidak bisa dihubungi. Foto yang ada tidak berubah. Coba lagi nanti.", // not in Pencil
    TOO_LARGE:
      "Folder terlalu besar untuk disinkronkan. Pecah ke beberapa folder lalu tambahkan lagi.", // not in Pencil (R-1)
  },
  syncDoneTitle: "Sinkronisasi selesai",
  syncDoneBody: (count: number) => `${String(count)} folder disinkronkan.`, // not in Pencil: per-folder diff not tracked
  syncFailedNames: (names: string) => `${names} gagal dibaca.`,
  syncFailedTitle: "Sinkronisasi gagal",
  syncFailedBody:
    "Google Drive sedang tidak bisa dihubungi. Foto yang ada tidak berubah. Coba lagi sebentar lagi.",
  linkDialogTitle: "Tambah folder",
  linkDialogDescription:
    "Foto di folder utama menjadi proof. Subfolder edited dan print menjadi hasil akhir.",
  linkSourceLabel: "Sumber",
  linkSourceHelper: "Hanya sumber aktif.",
  linkLabel: "Link folder Google Drive",
  linkPlaceholder: "https://drive.google.com/drive/folders/…",
  linkHelper: "Folder harus dibagikan sebagai “Siapa saja yang memiliki link”.",
  labelLabel: "Label",
  labelPlaceholder: "Contoh: Sesi wisuda",
  labelHelper: "Kosongkan untuk memakai nama folder dari Drive.",
  publicLinkTitle: "Link Drive melewati password galeri",
  publicLinkBody:
    "Siapa pun yang punya link folder bisa melihat fotonya langsung. Bagikan link galeri ke klien, bukan link Drive.",
  folderInUseTitle: "Folder sudah dipakai proyek lain",
  // Pencil names the folder; its name is only known after the first sync, so code says "Folder ini".
  folderInUseBody: (projects: string) =>
    `Folder ini juga tertaut ke galeri ${projects}. Klien kedua proyek bisa melihat foto yang sama.`,
  folderInUseConfirm: "Tetap tambahkan",
  linkedTitle: "Folder ditambahkan", // not in Pencil
} as const;
