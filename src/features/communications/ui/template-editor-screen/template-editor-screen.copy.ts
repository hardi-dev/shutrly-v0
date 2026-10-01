const NUMBER = new Intl.NumberFormat("id-ID");

// Editor copy from the v3 frames; "viewLabel" is not in Pencil (accessible name of the tabs).
export const TEMPLATE_EDITOR_COPY = {
  contentTitle: "Isi pesan",
  contentDescription: "Variabel diganti dengan data klien saat pesan dibagikan.",
  mobileTitle: "Pesan",
  contentLabel: "Isi pesan",
  helper: "Tulis variabel persis seperti chip di bawah, termasuk kurung kurawalnya.",
  mobileHelper: "Tulis variabel persis seperti chip di bawah.",
  counter: (length: number, max: number) => `${NUMBER.format(length)} / ${NUMBER.format(max)}`,
  variablesTitle: "Sisipkan variabel",
  variablesHint:
    "Klik untuk menyisipkan di posisi kursor. Variabel bertanda wajib harus ada di pesan.",
  mobileVariablesHint: "Ketuk untuk menyisipkan di posisi kursor.",
  previewTitle: "Pratinjau",
  previewDescription: "Memakai data contoh, bukan data klien.",
  viewLabel: "Tampilan pesan",
  edit: "Edit",
  preview: "Pratinjau",
  restore: "Kembalikan ke default",
  save: "Simpan",
  saving: "Menyimpan…",
  saved: "Template tersimpan",
  savedBody: (template: string) => `${template} akan memakai isi terbaru.`,
  serverErrorTitle: "Template belum tersimpan",
  serverErrorBody: "Terjadi kesalahan di server. Isi pesanmu masih di sini.",
  retry: "Coba lagi",
} as const;
