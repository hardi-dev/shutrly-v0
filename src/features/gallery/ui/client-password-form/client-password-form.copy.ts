// Source: copy-deck.md §14.1 "Password entry and unavailable access" (label, submit, pending, incorrect and rate-limited copy). Rows marked PROPOSED are listed in copy-deck.md §14.4.
export const CLIENT_PASSWORD_FORM_COPY_NAMESPACE = "clientPassword";

export const CLIENT_PASSWORD_FORM_COPY = {
  namespace: CLIENT_PASSWORD_FORM_COPY_NAMESPACE,
  surface: "gallery",
  messages: {
    en: {
      password: "Gallery password",
      // PROPOSED (pending Owner review)
      placeholder: "Type the password from your photographer",
      // PROPOSED (pending Owner review)
      helper: "Lowercase letters and numbers, for example mawar-4821.",
      submit: "Open gallery",
      submitting: "Opening gallery…",
      wrongPassword: "The password is incorrect. Check it and try again.",
      // PROPOSED (pending Owner review)
      empty: "Enter the password from your photographer.",
      lockedTitle: "Too many attempts. Try again later.",
      // PROPOSED (pending Owner review)
      lockedBody: "Try again in {minutes, plural, one {# minute} other {# minutes}}.",
      // PROPOSED (pending Owner review)
      lockedHelper: "The password isn’t checked until the time limit ends.",
      // PROPOSED (pending Owner review)
      showPassword: "Show password",
      // PROPOSED (pending Owner review)
      hidePassword: "Hide password",
      // PROPOSED (pending Owner review)
      failed: "The password couldn’t be checked. Try again.",
    },
    id: {
      password: "Kata sandi galeri",
      placeholder: "Ketik kata sandi dari fotografer",
      helper: "Huruf kecil dan angka, contoh mawar-4821.",
      submit: "Buka galeri",
      submitting: "Membuka galeri…",
      wrongPassword: "Kata sandinya salah. Cek lalu coba lagi.",
      empty: "Isi kata sandi dari fotografer.",
      lockedTitle: "Terlalu banyak percobaan. Coba lagi nanti.",
      lockedBody: "Coba lagi dalam {minutes, plural, other {# menit}}.",
      lockedHelper: "Kata sandi tidak diperiksa sampai batas waktu habis.",
      showPassword: "Tampilkan kata sandi",
      hidePassword: "Sembunyikan kata sandi",
      failed: "Gagal memeriksa kata sandi. Coba lagi.",
    },
  },
} as const;
