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
    form: {
      nameLabel: "Nama workspace",
      namePlaceholder: "Contoh: Studio Lime",
      nameDescription: "Nama ini akan terlihat oleh tim Anda.",
      prefixLabel: "Prefix invoice",
      prefixPlaceholder: "Contoh: SL",
      prefixDescription: "Gunakan 2–6 karakter huruf atau angka.",
    },
  },
  large: {
    title: "Detail workspace",
    description: "Lihat ringkasan dan detail workspace Anda.",
    body: "Konten detail workspace",
    close: "Tutup",
  },
} as const;
