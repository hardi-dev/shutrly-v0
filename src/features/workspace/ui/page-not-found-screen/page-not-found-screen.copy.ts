// Source: copy-deck.md §17.1 "Page not found inside a workspace (F-24)". Copied verbatim; approved by the Owner 2026-10-12.
export { OWNER_NAV_COPY_NAMESPACE } from "@/features/workspace/ui/owner-nav/owner-nav.copy";

export const PAGE_NOT_FOUND_COPY_NAMESPACE = "pageNotFound";

export const PAGE_NOT_FOUND_COPY = {
  namespace: PAGE_NOT_FOUND_COPY_NAMESPACE,
  surface: "owner",
  messages: {
    en: {
      title: "Page not found",
      body: "This page doesn’t exist or was removed.",
      backToSection: "Back to {section}",
      backToDashboard: "Back to dashboard",
    },
    id: {
      title: "Halaman tidak ditemukan",
      body: "Halaman ini tidak ada atau sudah dihapus.",
      backToSection: "Kembali ke {section}",
      backToDashboard: "Kembali ke dasbor",
    },
  },
} as const;

export { PAGE_HEADER_COPY_NAMESPACE } from "@/ui/patterns/page-header/page-header.copy";
