// Source: copy-deck.md §2.4. Copied verbatim.
export const FORGOT_PASSWORD_FORM_COPY_NAMESPACE = "authForgotPasswordForm";

export const FORGOT_PASSWORD_FORM_COPY = {
  namespace: FORGOT_PASSWORD_FORM_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      email: "Email",
      emailPlaceholder: "you@studio.com",
      submit: "Send reset link",
      submitting: "Sending…",
    },
    id: {
      email: "Email",
      emailPlaceholder: "nama@studio.com",
      submit: "Kirim tautan atur ulang",
      submitting: "Mengirim…",
    },
  },
} as const;
