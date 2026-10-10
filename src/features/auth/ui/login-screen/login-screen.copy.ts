// Source: copy-deck.md §2.1. Copied verbatim.
export const LOGIN_SCREEN_COPY_NAMESPACE = "authLoginScreen";

export const LOGIN_SCREEN_COPY = {
  namespace: LOGIN_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Welcome back",
      lead: "Your next shoot, photos to edit, and results to deliver. Pick up where you left off.",
      switchPrompt: "New to Shutrly?",
      switchLink: "Create an account",
    },
    id: {
      title: "Selamat datang kembali",
      lead: "Jadwal pemotretan berikutnya, foto untuk diedit, dan hasil untuk dikirim. Masuk dan lanjutkan pekerjaanmu.",
      switchPrompt: "Baru di Shutrly?",
      switchLink: "Buat akun",
    },
  },
} as const;
