// Source: copy-deck.md §2.2. Copied verbatim.
export const REGISTER_SCREEN_COPY_NAMESPACE = "authRegisterScreen";

export const REGISTER_SCREEN_COPY = {
  namespace: REGISTER_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Create your account",
      lead: "Start recording what each client has booked and when you’ll shoot.",
      switchPrompt: "Already have an account?",
      switchLink: "Sign in",
    },
    id: {
      title: "Buat akunmu",
      lead: "Mulai catat paket yang dipesan tiap klien dan jadwal pemotretannya.",
      switchPrompt: "Sudah punya akun?",
      switchLink: "Masuk",
    },
  },
} as const;
