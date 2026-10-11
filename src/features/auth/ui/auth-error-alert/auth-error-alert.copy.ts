// Source: copy-deck.md §2.7 (auth error mappings). Keys are the stable AuthErrorCode values. // DECK GAP on ACCOUNT_UNAVAILABLE: no row for the short alert; en and id are the first sentence of the §2.6 lead.
export const AUTH_ERROR_COPY_NAMESPACE = "authError";

export const AUTH_ERROR_COPY = {
  namespace: AUTH_ERROR_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      VALIDATION_FAILED: "Check the highlighted fields.",
      INVALID_CREDENTIALS: "The email or password is incorrect.",
      RATE_LIMITED: "Too many attempts. Try again later.",
      EMAIL_UNVERIFIED: "Verify your email to continue.",
      ACCOUNT_UNAVAILABLE: "This account can’t access Shutrly right now.",
      AUTH_REQUIRED: "Sign in to continue.",
      INVALID_LINK: "This link may have expired or already been used.",
      WRONG_CURRENT_PASSWORD: "Your current password is incorrect.",
      GOOGLE_CANCELLED: "Google sign-in was canceled.",
      GOOGLE_FAILED: "Couldn’t sign in with Google. Try again.",
      EMAIL_DELIVERY_FAILED: "Couldn’t send the email. Try again in a moment.",
    },
    id: {
      VALIDATION_FAILED: "Cek kolom yang ditandai.",
      INVALID_CREDENTIALS: "Email atau kata sandi salah.",
      RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi nanti.",
      EMAIL_UNVERIFIED: "Verifikasi emailmu untuk melanjutkan.",
      ACCOUNT_UNAVAILABLE: "Akun ini belum bisa mengakses Shutrly.",
      AUTH_REQUIRED: "Masuk untuk melanjutkan.",
      INVALID_LINK: "Tautannya mungkin kedaluwarsa atau sudah dipakai.",
      WRONG_CURRENT_PASSWORD: "Kata sandi saat ini salah.",
      GOOGLE_CANCELLED: "Proses masuk dengan Google dibatalkan.",
      GOOGLE_FAILED: "Belum bisa masuk dengan Google. Coba lagi.",
      EMAIL_DELIVERY_FAILED: "Email belum terkirim. Coba lagi sebentar lagi.",
    },
  },
} as const;
