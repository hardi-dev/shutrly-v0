export const CLIENT_PASSWORD_FORM_COPY = {
  password: "Password",
  placeholder: "Ketik password dari fotografer",
  helper: "Huruf kecil dan angka, contoh mawar-4821.",
  submit: "Buka galeri",
  // not in Pencil
  submitting: "Memeriksa…",
  wrongPassword: "Password salah. Periksa lagi, lalu coba lagi.",
  // not in Pencil
  empty: "Isi password dari fotografer.",
  lockedTitle: "Terlalu banyak percobaan",
  lockedBody: (minutes: number) => `Coba lagi dalam ${String(minutes)} menit.`,
  lockedHelper: "Password tidak diperiksa sampai batas waktu habis.",
  showPassword: "Tampilkan password",
  hidePassword: "Sembunyikan password",
  // not in Pencil
  failed: "Gagal memeriksa password. Coba lagi.",
} as const;
