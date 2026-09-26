import "server-only";

// not in Pencil — auth email copy (Indonesian, CONFLICT-1 resolved 2026-09-27); Owner review.
export const AUTH_EMAIL_COPY = {
  greeting: "Halo",
  VERIFY_EMAIL: {
    subject: "Verifikasi email Anda untuk Shutrly",
    intro: "Konfirmasi email Anda untuk menyelesaikan pendaftaran Shutrly.",
    action: "Verifikasi email",
    expiry: "Tautan ini berlaku 24 jam dan hanya bisa dipakai sekali.",
    ignore: "Jika Anda tidak membuat akun Shutrly, abaikan email ini.",
  },
  RESET_PASSWORD: {
    subject: "Atur ulang kata sandi Shutrly Anda",
    intro: "Buat kata sandi baru untuk akun Shutrly Anda.",
    action: "Buat kata sandi baru",
    expiry: "Tautan ini berlaku satu jam dan hanya bisa dipakai sekali.",
    ignore: "Jika Anda tidak memintanya, abaikan email ini. Kata sandi Anda tidak berubah.",
  },
} as const;
