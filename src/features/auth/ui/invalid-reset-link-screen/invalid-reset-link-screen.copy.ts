// Source: copy-deck.md §2.5 (invalid-link state) and §2.3 (single-use alert title).
export const INVALID_RESET_LINK_SCREEN_COPY_NAMESPACE = "authInvalidResetLink";

export const INVALID_RESET_LINK_SCREEN_COPY = {
  namespace: INVALID_RESET_LINK_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "This reset link is no longer valid",
      lead: "Request a new password-reset link to continue.",
      alertTitle: "Each link can be used once",
      alertBody: "Each reset link can only be used once.",
      action: "Request reset link",
      back: "Back to sign in",
    },
    id: {
      title: "Tautan atur ulang ini sudah tidak berlaku",
      lead: "Minta tautan atur ulang kata sandi yang baru untuk melanjutkan.",
      alertTitle: "Setiap tautan hanya bisa dipakai sekali",
      alertBody: "Setiap tautan atur ulang hanya bisa dipakai sekali.",
      action: "Minta tautan atur ulang",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
