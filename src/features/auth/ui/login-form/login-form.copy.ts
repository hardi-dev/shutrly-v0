// Source: copy-deck.md §2.1. Copied verbatim.
export const LOGIN_FORM_COPY_NAMESPACE = "authLoginForm";

export const LOGIN_FORM_COPY = {
  namespace: LOGIN_FORM_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      email: "Email",
      emailPlaceholder: "you@studio.com",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgot: "Forgot your password?",
      submit: "Sign in",
      submitting: "Signing in…",
    },
    id: {
      email: "Email",
      emailPlaceholder: "nama@studio.com",
      password: "Kata sandi",
      passwordPlaceholder: "Masukkan kata sandimu",
      forgot: "Lupa kata sandi?",
      submit: "Masuk",
      submitting: "Sedang masuk…",
    },
  },
} as const;
