// Source: copy-deck.md §3 'Page/section title', 'Profile description', 'Password section', 'Password description', 'Google-only title' and 'Google-only body'.
export const ACCOUNT_SECTIONS_COPY_NAMESPACE = "authAccountSections";

export const ACCOUNT_SECTIONS_COPY = {
  namespace: ACCOUNT_SECTIONS_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      profileTitle: "Profile",
      profileLead: "Update the name shown across your workspaces.",
      passwordTitle: "Password",
      passwordLead: "Change your password. Your other sessions will be signed out.",
      googleOnlyTitle: "You sign in with Google",
      googleOnlyBody: "This account has no password. Choose Continue with Google to sign in.",
    },
    id: {
      profileTitle: "Profil",
      profileLead: "Perbarui nama yang tampil di semua ruang kerjamu.",
      passwordTitle: "Kata sandi",
      passwordLead: "Ganti kata sandimu. Sesi di perangkat lain akan dikeluarkan.",
      googleOnlyTitle: "Kamu masuk dengan Google",
      googleOnlyBody: "Akun ini tidak punya kata sandi. Pilih Lanjutkan dengan Google untuk masuk.",
    },
  },
} as const;
