// Source: copy-deck.md §2.3. Copied verbatim.
export const VERIFY_PENDING_SCREEN_COPY_NAMESPACE = "authVerifyPending";

export const VERIFY_PENDING_SCREEN_COPY = {
  namespace: VERIFY_PENDING_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Check your email",
      lead: "If this address needs verification, a link is on its way. Open it to continue.",
      alertTitle: "The link is valid for 24 hours",
      alertBody: "Check your spam folder if the email hasn’t arrived.",
      back: "Back to sign in",
    },
    id: {
      title: "Cek emailmu",
      lead: "Kalau alamat ini perlu diverifikasi, tautannya sedang dikirim. Buka tautannya untuk melanjutkan.",
      alertTitle: "Tautan berlaku 24 jam",
      alertBody: "Cek folder spam kalau emailnya belum masuk.",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
