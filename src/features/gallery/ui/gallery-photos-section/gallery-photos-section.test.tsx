import { render, screen } from "@testing-library/react";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it } from "vitest";

import { GalleryPhotosSection } from "./gallery-photos-section";

function photo(index: number, missing = false) {
  return {
    id: `p-${String(index)}`,
    fileName: `IMG_${String(index).padStart(3, "0")}.jpg`,
    kind: "PROOF" as const,
    folderPath: "",
    browsePath: "",
    sourceId: "s-1",
    sourceName: "Rina-Wisuda",
    missing,
    driveUrl: missing ? null : "https://drive.google.com/file/d/x/view",
  };
}

const PAGE = {
  project: { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const },
  gallery: {
    id: "g-1",
    status: "DRAFT" as const,
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 1,
    failedSourceCount: 0,
    counts: { proof: 8, edited: 2, print: 1, missing: 1 },
  },
  sources: [],
  linkableSources: [],
  previewPhotos: Array.from({ length: 8 }, (_, index) => photo(index + 1, index === 1)),
};

describe("GalleryPhotosSection", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-014 shows the counts, the visibility line and 8 tiles with Hilang", () => {
    const { container } = render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} />);
    expect(screen.getByText("8 proof (1 hilang) · 2 edited · 1 print")).toBeInTheDocument();
    expect(
      screen.getByText(/Terlihat oleh klien setelah galeri dipublikasikan\. Foto bertanda Hilang/),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(8);
    expect(screen.getByText("Hilang")).toBeInTheDocument();
  });

  it("AC-GAL-015 loads thumbnails only from the Owner endpoint", () => {
    const { container } = render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} />);
    for (const image of container.querySelectorAll("img")) {
      expect(image.getAttribute("src")).toMatch(/^\/api\/w\/ws-1\/gallery-photos\/p-\d+\/thumb$/);
    }
    expect(container.innerHTML).not.toMatch(/googleusercontent|drive\.google/);
  });

  it("design shows 6 tiles on phones", () => {
    stubViewport(true);
    const { container } = render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} />);
    expect(container.querySelectorAll("img")).toHaveLength(6);
  });
});
