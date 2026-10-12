// Source: copy-deck.md §2.3 (resend, cooldown and resent rows). The cooldown is one ICU message with {seconds}.
export const RESEND_VERIFICATION_COPY_NAMESPACE = "authResendVerification";

export const RESEND_VERIFICATION_COPY = {
  namespace: RESEND_VERIFICATION_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      resend: "Resend verification email",
      cooldown: "You can request another email in {seconds} seconds.",
      sent: "A new link has been sent.",
    },
    id: {
      resend: "Kirim ulang email verifikasi",
      cooldown: "Kamu bisa meminta email lagi dalam {seconds} detik.",
      sent: "Tautan baru sudah dikirim.",
    },
  },
} as const;
