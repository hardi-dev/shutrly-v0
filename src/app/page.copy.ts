import type { CopyModule } from "@/composition/locale/message-catalog/message-catalog.types";

// Source: copy-deck.md §19, the page title, description and share-image rows. Copied verbatim.
// The site name "Shutrly" is the brand and stays in page.tsx.
export const HOME_PAGE_COPY_NAMESPACE = "landingHomePage";

export const HOME_PAGE_COPY: CopyModule = {
  namespace: HOME_PAGE_COPY_NAMESPACE,
  surface: "landing",
  messages: {
    en: {
      title: "Shutrly — Less busywork. More photography.",
      description:
        "A workspace for photographers to manage projects, client photo selections and invoices in one workspace. Join the waitlist.",
      shareImageAlt:
        "Shutrly — Less busywork. More photography. A workspace for photographers to manage projects, photo selections and invoices.",
    },
    id: {
      title: "Shutrly — Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi.",
      description:
        "Ruang kerja untuk fotografer mengelola proyek, pilihan foto klien, dan tagihan dalam satu ruang kerja. Gabung daftar tunggu.",
      shareImageAlt:
        "Shutrly — Lebih sedikit kerja admin. Lebih banyak waktu untuk fotografi. Ruang kerja untuk fotografer mengelola proyek, pilihan foto, dan tagihan.",
    },
  },
};
