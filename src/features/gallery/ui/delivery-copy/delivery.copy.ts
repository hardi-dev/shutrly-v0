// The Owner's *Hasil akhir* card and dialogs (owner-4-hasil-akhir exports, F-10 Slice 8).
export const DELIVERY_COPY = {
  cardTitle: "Hasil akhir",
  cardDescription: "Unduhan untuk klien.",
  publish: "Publikasikan hasil akhir",
  complete: "Tandai selesai",
  noFilesNote:
    "Belum ada hasil akhir yang tersinkron. Buat subfolder hasil akhir di Drive, petakan ke item paket lewat Edit folder, lalu sinkronkan galeri.",
  inactiveNote: "Galeri harus dipublikasikan lebih dulu supaya klien bisa membuka hasil akhir.",
  // F-20: one row and one phrase per package item
  itemCount: (count: number) => `${String(count)} file`,
  itemFiles: (count: number, name: string) => `${String(count)} file ${name}`,
  and: " dan ",
  publishedTitle: (when: string) => `Dipublikasikan ${when}`,
  publishedMeta: (files: string) => `Klien bisa mengunduh ${files}.`,
  completedTitle: (when: string) => `Selesai ${when}`,
  completedMeta: "Galeri tetap terbuka selama masih dipublikasikan.",
  chip: { READY: "Siap", PUBLISHED: "Dipublikasikan", COMPLETED: "Selesai" },
  // owner-7: the project header of a delivered project
  headerMeta: (when: string) => `Hasil akhir dipublikasikan ${when}`,
  publishTitle: "Publikasikan hasil akhir?",
  publishDescription: "Klien bisa mengunduh lewat link dan password yang sama.",
  // The export ends with "menjadi Dikirim"; the project status chip says *Terkirim* (drift reported).
  publishBody: (files: string) =>
    `${files} akan terlihat oleh klien. Status proyek menjadi Terkirim.`,
  publishConfirm: "Publikasikan",
  completeTitle: "Tandai proyek selesai?",
  completeDescription: (title: string) => `Proyek ${title} akan berstatus Selesai.`,
  completeBody:
    "Status tidak bisa dikembalikan. Saldo invoice tidak menghalangi, dan klien tetap bisa membuka galeri selama masih dipublikasikan.",
  refusedTitle: "Hasil akhir belum bisa dipublikasikan",
  refusedDescription: "Periksa hal berikut lebih dulu.",
  reason: {
    NO_FINISHED_FILE: "Belum ada hasil akhir yang tersinkron.",
    GALLERY_NOT_PUBLISHED: "Galeri harus berstatus dipublikasikan.",
    // not in Pencil: the project is no longer BOOKED, SHOOTING or POST_PROCESSING
    PROJECT_STATUS: "Status proyek ini tidak bisa diubah menjadi Terkirim.",
  },
  refusedConfirm: "Mengerti",
  // not in Pencil: toasts after each action
  publishedToast: "Hasil akhir dipublikasikan",
  completedToast: "Proyek ditandai selesai",
  staleToast: "Status proyek sudah berubah. Muat ulang halaman.",
  failedToast: "Gagal menyimpan. Coba lagi.",
} as const;
