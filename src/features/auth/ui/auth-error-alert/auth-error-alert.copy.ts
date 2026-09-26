import type { AuthErrorCode } from "@/features/auth/application/errors/auth-errors/auth-errors.types";

// Indonesian (CONFLICT-1, 2026-09-27). INVALID_CREDENTIALS is auth.pen DjUek; the rest is
// spec wording or // not in Pencil, listed for Owner review in design.md.
export const AUTH_ERROR_COPY: Record<AuthErrorCode, string> = {
  VALIDATION_FAILED: "Periksa kolom yang ditandai.", // not in Pencil
  INVALID_CREDENTIALS: "Email atau kata sandi salah.",
  RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi nanti.",
  EMAIL_UNVERIFIED: "Verifikasi email Anda untuk melanjutkan.", // not in Pencil
  ACCOUNT_UNAVAILABLE: "Akun ini tidak bisa mengakses Shutrly saat ini.",
  AUTH_REQUIRED: "Masuk untuk melanjutkan.", // not in Pencil
  INVALID_LINK: "Tautan mungkin sudah kedaluwarsa atau sudah dipakai.",
  WRONG_CURRENT_PASSWORD: "Kata sandi saat ini salah.",
  GOOGLE_CANCELLED: "Masuk dengan Google dibatalkan.",
  GOOGLE_FAILED: "Kami tidak bisa memasukkan Anda dengan Google.",
  EMAIL_DELIVERY_FAILED: "Email tidak bisa dikirim. Coba lagi sebentar lagi.", // not in Pencil
};
