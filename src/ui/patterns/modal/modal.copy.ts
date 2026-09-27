export const MODAL_COPY = {
  close: "Tutup",
  small: {
    title: "Hapus proyek?",
    body: "Proyek ini dan semua data terkait akan dihapus.",
    cancel: "Batal",
    confirm: "Hapus proyek",
  },
  medium: {
    title: "Buat workspace",
    description: "Tambahkan workspace baru untuk tim Anda.",
    body: "Isi modal",
    cancel: "Batal",
    confirm: "Simpan",
  },
  large: {
    title: "Detail workspace",
    description: "Lihat ringkasan dan detail workspace Anda.",
    body: "Konten detail workspace",
    close: "Tutup",
  },
} as const;
