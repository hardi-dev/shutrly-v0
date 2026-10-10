// Source: copy-deck.md §2.4 (sent state). Copied verbatim.
export const RESET_SENT_SCREEN_COPY_NAMESPACE = "authResetSent";

export const RESET_SENT_SCREEN_COPY = {
  namespace: RESET_SENT_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Check your inbox",
      lead: "If password reset is available for this address, we’ll send a link.",
      alertTitle: "The link is valid for one hour",
      alertBody: "Check your spam folder if the email hasn’t arrived.",
      back: "Back to sign in",
    },
    id: {
      title: "Cek kotak masukmu",
      lead: "Kalau atur ulang kata sandi tersedia untuk alamat ini, kami akan mengirim tautannya.",
      alertTitle: "Tautan berlaku satu jam",
      alertBody: "Cek folder spam kalau emailnya belum masuk.",
      back: "Kembali ke halaman masuk",
    },
  },
} as const;
