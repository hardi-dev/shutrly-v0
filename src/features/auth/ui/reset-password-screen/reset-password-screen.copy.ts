// Source: copy-deck.md §2.5. Copied verbatim.
export const RESET_PASSWORD_SCREEN_COPY_NAMESPACE = "authResetPasswordScreen";

export const RESET_PASSWORD_SCREEN_COPY = {
  namespace: RESET_PASSWORD_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Set a new password",
      lead: "Use 8–128 characters. After resetting, sign in again on each device.",
      switchPrompt: "Remember your password?",
      back: "Back to sign in",
    },
    id: {
      title: "Buat kata sandi baru",
      lead: "Gunakan 8–128 karakter. Setelah diatur ulang, masuk lagi di setiap perangkat.",
      switchPrompt: "Ingat kata sandimu?",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
