// The project page's *Akses klien* card and *Ganti link* (owner-5-akses-klien exports, F-10 Slice 10).
export const PROJECT_ACCESS_COPY = {
  title: "Akses klien",
  description: "Link dan password untuk klien.",
  rotateLink: "Ganti link",
  rotatePassword: "Ganti password",
  link: "Link",
  password: "Password",
  expiry: "Kedaluwarsa",
  inactive: "Tidak aktif",
  draftNote: "Klien belum bisa membuka link ini sampai galeri dipublikasikan.",
  archivedNote: "Galeri diarsipkan. Link tidak bisa dibuka dan tidak bisa diganti.",
  dialogTitle: "Ganti link galeri?",
  dialogDescription: "Link lama berhenti bekerja.",
  dialogBody: "Semua link yang sudah Anda bagikan, termasuk link invoice, tidak bisa dibuka lagi.",
  dialogNote: "Password tidak berubah. Bagikan link baru ke klien.",
  cancel: "Batal",
  // not in Pencil: copy button names and the toasts
  copyLink: "Salin link",
  copyPassword: "Salin password",
  copied: "Disalin",
  // not in Pencil: the browser refused the clipboard, so the text is shown whole and selected
  copyFailedTitle: "Belum tersalin",
  copyFailedBody:
    "Teksnya sudah ditandai. Salin dengan Ctrl+C atau ⌘C, atau tekan lama lalu Salin.",
  rotatedToast: "Link baru siap. Bagikan ke klien.",
  cancelledToast: "Proyek dibatalkan, link tidak bisa diganti.",
  failedToast: "Gagal mengganti link. Coba lagi.",
} as const;
