// Source: copy-deck.md §19, the hero and product-image rows. Copied verbatim; the Indonesian column is
// the reviewed target copy. The header and footer copy live in their own sibling modules.
export const LANDING_PAGE_COPY_NAMESPACE = "landingPage";

// The removal and contact address (Owner 2026-10-08, AC-LND-011). An identity value, not translated.
export const LANDING_CONTACT_EMAIL = "hello@shutrly.space";

export const LANDING_PAGE_COPY = {
  namespace: LANDING_PAGE_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      audience: "YOUR STUDIO, IN ONE PLACE",
      description:
        "A workspace to manage your projects, photo selections, and invoices. All in one workspace.",
      laptopAlt: "Shutrly’s project list on a laptop",
      phoneAlt: "Shutrly’s project list on a phone",
    },
    id: {
      audience: "STUDIO-MU, DI SATU TEMPAT",
      description:
        "Ruang kerja untuk mengelola proyek, pilihan foto, dan tagihanmu. Semuanya dalam satu ruang kerja.",
      laptopAlt: "Daftar proyek Shutrly di laptop",
      phoneAlt: "Daftar proyek Shutrly di ponsel",
    },
  },
} as const;
