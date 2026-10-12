// Source: copy-deck.md §2.2. Copied verbatim.
export const REGISTER_FORM_COPY_NAMESPACE = "authRegisterForm";

export const REGISTER_FORM_COPY = {
  namespace: REGISTER_FORM_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      name: "Your name",
      namePlaceholder: "Full name",
      email: "Email",
      emailPlaceholder: "you@studio.com",
      password: "Password",
      passwordPlaceholder: "8–128 characters",
      submit: "Create account",
      submitting: "Creating account…",
    },
    id: {
      name: "Namamu",
      namePlaceholder: "Nama lengkap",
      email: "Email",
      emailPlaceholder: "nama@studio.com",
      password: "Kata sandi",
      passwordPlaceholder: "8–128 karakter",
      submit: "Buat akun",
      submitting: "Membuat akun…",
    },
  },
} as const;
