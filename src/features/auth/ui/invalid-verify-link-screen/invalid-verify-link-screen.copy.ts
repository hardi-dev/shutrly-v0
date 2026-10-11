// Source: copy-deck.md §2.3 (invalid-link state). Copied verbatim.
export const INVALID_VERIFY_LINK_SCREEN_COPY_NAMESPACE = "authInvalidVerifyLink";

export const INVALID_VERIFY_LINK_SCREEN_COPY = {
  namespace: INVALID_VERIFY_LINK_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "This link is no longer valid",
      lead: "It may have expired or already been used. Request a new link to continue.",
      alertTitle: "Each link can be used once",
      alertBody: "Verification and password-reset links can only be used once.",
      action: "Request a new link",
      back: "Back to sign in",
    },
    id: {
      title: "Tautan ini sudah tidak berlaku",
      lead: "Tautannya mungkin kedaluwarsa atau sudah dipakai. Minta tautan baru untuk melanjutkan.",
      alertTitle: "Setiap tautan hanya bisa dipakai sekali",
      alertBody: "Tautan verifikasi dan atur ulang kata sandi hanya bisa dipakai sekali.",
      action: "Minta tautan baru",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
