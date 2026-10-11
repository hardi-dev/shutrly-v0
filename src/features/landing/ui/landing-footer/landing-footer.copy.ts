// Source: copy-deck.md §19, the footer rows. Copied verbatim. The copyright keeps the brand name in
// both languages.
export const LANDING_FOOTER_COPY_NAMESPACE = "landingFooter";

export const LANDING_FOOTER_COPY = {
  namespace: LANDING_FOOTER_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      copyright: "© 2026 Shutrly",
      contact: "Contact",
      privacy: "Privacy",
      footerLabel: "Footer",
    },
    id: {
      copyright: "© 2026 Shutrly",
      contact: "Kontak",
      privacy: "Privasi",
      footerLabel: "Footer",
    },
  },
} as const;
