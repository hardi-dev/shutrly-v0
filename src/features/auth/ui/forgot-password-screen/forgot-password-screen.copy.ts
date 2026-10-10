// Source: copy-deck.md §2.4. Copied verbatim.
export const FORGOT_PASSWORD_SCREEN_COPY_NAMESPACE = "authForgotPasswordScreen";

export const FORGOT_PASSWORD_SCREEN_COPY = {
  namespace: FORGOT_PASSWORD_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Reset your password",
      lead: "Enter your email. If password reset is available for this address, we’ll send a link.",
      switchPrompt: "Remember your password?",
      back: "Back to sign in",
    },
    id: {
      title: "Atur ulang kata sandi",
      lead: "Masukkan emailmu. Kalau atur ulang kata sandi tersedia untuk alamat ini, kami akan mengirim tautannya.",
      switchPrompt: "Ingat kata sandimu?",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
