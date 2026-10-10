// Source: copy-deck.md §3 password rows and §2.7 field labels.
export const CHANGE_PASSWORD_FORM_COPY_NAMESPACE = "authChangePasswordForm";

export const CHANGE_PASSWORD_FORM_COPY = {
  namespace: CHANGE_PASSWORD_FORM_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      current: "Current password",
      currentPlaceholder: "Enter your current password",
      next: "New password",
      nextPlaceholder: "8–128 characters",
      confirm: "Confirm new password",
      confirmPlaceholder: "Enter it again",
      submit: "Change password",
      submitting: "Changing password…",
      done: "Password changed. Your other sessions have been signed out.",
    },
    id: {
      current: "Kata sandi saat ini",
      currentPlaceholder: "Masukkan kata sandi saat ini",
      next: "Kata sandi baru",
      nextPlaceholder: "8–128 karakter",
      confirm: "Konfirmasi kata sandi baru",
      confirmPlaceholder: "Masukkan sekali lagi",
      submit: "Ganti kata sandi",
      submitting: "Mengganti kata sandi…",
      done: "Kata sandi diganti. Sesi di perangkat lain sudah dikeluarkan.",
    },
  },
} as const;
