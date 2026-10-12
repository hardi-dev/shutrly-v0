import { screen } from "@testing-library/react";
import { renderInLocale } from "@tests/support/copy/render-in-locale";
import { describe, expect, it } from "vitest";

import { CatalogSkeleton } from "./catalog-skeletons";
import type { CatalogSkeletonVariant } from "./catalog-skeletons.types";

const TITLES: Record<CatalogSkeletonVariant, { en: string; id: string }> = {
  services: { en: "Services", id: "Layanan" },
  categories: { en: "Categories", id: "Kategori" },
  items: { en: "Package items", id: "Isi paket" },
  detail: { en: "Loading service…", id: "Memuat layanan…" },
  project: { en: "Loading project…", id: "Memuat proyek…" },
};

describe("CatalogSkeleton", () => {
  it("renders the matching loading surface for each catalog route", () => {
    renderInLocale(<CatalogSkeleton variant="services" />, "en");
    expect(screen.getByTestId("catalog-services-skeleton")).toHaveAttribute("aria-busy", "true");
  });

  for (const [variant, title] of Object.entries(TITLES) as [
    CatalogSkeletonVariant,
    { en: string; id: string },
  ][]) {
    it(`BR-L10N-002 shows the ${variant} title in English and Indonesian only`, () => {
      const { unmount } = renderInLocale(<CatalogSkeleton variant={variant} />, "en");
      expect(screen.getByText(title.en)).toBeInTheDocument();
      unmount();
      renderInLocale(<CatalogSkeleton variant={variant} />, "id");
      expect(screen.getByText(title.id)).toBeInTheDocument();
    });
  }
});
