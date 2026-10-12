// Source: copy-deck.md §19, the waitlist form rows. Copied verbatim. The privacy note carries the
// removal address inside a <mail> tag, so the component can make it a mail link (AC-LND-011).
// The error keys are flat (next-intl reads dots as nesting); the component maps the server's codes to them.
export const WAITLIST_FORM_COPY_NAMESPACE = "landingWaitlistForm";

export const WAITLIST_FORM_COPY = {
  namespace: WAITLIST_FORM_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      emailLabel: "Email address",
      emailPlaceholder: "Enter your email",
      submit: "Join the waitlist",
      submitShort: "Join waitlist",
      submitting: "Joining…",
      promise: "Get notified when Shutrly launches. No spam.",
      privacy:
        "We only use your email to tell you about the launch. It’s kept with our email provider, never shared, and removed whenever you ask at <mail>hello@shutrly.space</mail>.",
      botLabel: "Leave this field empty",
      errorRequired: "Enter your email address.",
      errorInvalid: "Enter a valid email address, like name@example.com.",
      errorTooLong: "This email is too long. Use one with at most 254 characters.",
      failed: "That didn’t work. Please try again.",
      rateLimited: "Too many attempts. Please try again in a moment.",
      successTitle: "You’re on the list.",
      successBody: "We’ll email you when Shutrly opens.",
    },
    id: {
      emailLabel: "Alamat email",
      emailPlaceholder: "Masukkan emailmu",
      submit: "Gabung daftar tunggu",
      submitShort: "Gabung daftar tunggu",
      submitting: "Sedang bergabung…",
      promise: "Dapatkan kabar saat Shutrly diluncurkan. Tanpa spam.",
      privacy:
        "Emailmu hanya dipakai untuk memberi kabar tentang peluncuran Shutrly. Email disimpan di penyedia email kami, tidak dibagikan, dan akan dihapus kalau kamu minta lewat <mail>hello@shutrly.space</mail>.",
      botLabel: "Kosongkan kolom ini",
      errorRequired: "Masukkan alamat emailmu.",
      errorInvalid: "Masukkan alamat email yang valid, misalnya nama@example.com.",
      errorTooLong: "Email ini terlalu panjang. Gunakan alamat maksimal 254 karakter.",
      failed: "Belum berhasil. Coba lagi.",
      rateLimited: "Terlalu banyak percobaan. Coba lagi sebentar.",
      successTitle: "Kamu sudah masuk daftar.",
      successBody: "Kami akan mengirim email saat Shutrly dibuka.",
    },
  },
} as const;
