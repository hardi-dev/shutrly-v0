// Source: copy-deck.md §2.5. Copied verbatim.
export const RESET_PASSWORD_FORM_COPY_NAMESPACE = "authResetPasswordForm";

export const RESET_PASSWORD_FORM_COPY = {
  namespace: RESET_PASSWORD_FORM_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      password: "New password",
      passwordPlaceholder: "Enter a new password",
      confirm: "Confirm new password",
      confirmPlaceholder: "Enter it again",
      submit: "Save new password",
      submitting: "Saving…",
    },
    id: {
      password: "Kata sandi baru",
      passwordPlaceholder: "Masukkan kata sandi baru",
      confirm: "Konfirmasi kata sandi baru",
      confirmPlaceholder: "Masukkan sekali lagi",
      submit: "Simpan kata sandi baru",
      submitting: "Menyimpan…",
    },
  },
} as const;
