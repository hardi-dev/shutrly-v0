// Source: copy-deck.md §2.6. Copied verbatim.
export const ACCOUNT_UNAVAILABLE_SCREEN_COPY_NAMESPACE = "authAccountUnavailable";

export const ACCOUNT_UNAVAILABLE_SCREEN_COPY = {
  namespace: ACCOUNT_UNAVAILABLE_SCREEN_COPY_NAMESPACE,
  surface: "auth",
  messages: {
    en: {
      title: "Account unavailable",
      lead: "This account can’t access Shutrly right now. Contact support if you think this is a mistake.",
      alertTitle: "Workspace data is hidden",
      alertBody: "Your workspaces and personal data aren’t displayed while access is unavailable.",
      signOut: "Sign out",
    },
    id: {
      title: "Akun tidak tersedia",
      lead: "Akun ini belum bisa mengakses Shutrly. Hubungi dukungan kalau menurutmu ini keliru.",
      alertTitle: "Data ruang kerja disembunyikan",
      alertBody: "Ruang kerja dan data pribadimu tidak ditampilkan selama akses tidak tersedia.",
      signOut: "Keluar",
    },
  },
} as const;
