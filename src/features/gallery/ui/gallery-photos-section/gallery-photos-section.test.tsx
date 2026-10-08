import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
    externalFileId: "1AbCdEfGhIjKlMnOp",
    provider: "GOOGLE_DRIVE" as const,
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
    failedSourceNames: [],
    counts: { proof: 8, edited: 2, print: 1, missing: 1 },
  },
  sources: [],
  linkableSources: [],
  directImages: false,
  previewPhotos: Array.from({ length: 6 }, (_, index) => photo(index + 1, index === 1)),
};

describe("GalleryPhotosSection", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-014 shows the counts, the visibility line and 6 tiles with Hilang", () => {
    const { container } = render(
      <GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />,
    );
    expect(screen.getByText("8 proof (1 hilang) · 3 hasil akhir")).toBeInTheDocument();
    expect(
      screen.getByText(/Terlihat oleh klien setelah galeri dipublikasikan\. Foto bertanda Hilang/),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(6);
    expect(screen.getByText("Hilang")).toBeInTheDocument();
  });

  it("AC-GAL-015 loads thumbnails from Google by file ID, with the Owner endpoint as fallback", () => {
    const { container } = render(
      <GalleryPhotosSection
        workspaceId="ws-1"
        page={{ ...PAGE, directImages: true }}
        browseAction={vi.fn()}
      />,
    );
    const image = container.querySelector("img");
    expect(image?.getAttribute("src")).toBe(
      "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOp=w600",
    );
    expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
    fireEvent.error(image as HTMLImageElement);
    expect(container.querySelector("img")?.getAttribute("src")).toMatch(
      /^\/api\/w\/ws-1\/gallery-photos\/[^/]+\/thumb$/,
    );
  });

  it("AC-GAL-015 loads thumbnails only from the Owner endpoint", () => {
    const { container } = render(
      <GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />,
    );
    for (const image of container.querySelectorAll("img")) {
      expect(image.getAttribute("src")).toMatch(/^\/api\/w\/ws-1\/gallery-photos\/p-\d+\/thumb$/);
    }
    expect(container.innerHTML).not.toMatch(/googleusercontent|drive\.google/);
  });

  it("Owner 7 previews the photos in 3 columns at every width, described on desktop only", () => {
    const { container, unmount } = render(
      <GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />,
    );
    expect(container.querySelector("ul")?.className).toContain("grid-cols-3");
    expect(container.querySelector("ul")?.className).not.toContain("md:grid-cols-4");
    expect(screen.getByText(/^Cuplikan 6 foto pertama\./)).toBeInTheDocument();
    unmount();
    stubViewport(true);
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />);
    expect(screen.queryByText(/^Cuplikan/)).not.toBeInTheDocument();
  });

  it("AC-GAL-031 previews a card photo with its meta and the Drive link, and a missing one without it", async () => {
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "IMG_001.jpg" }));
    const viewer = await screen.findByRole("dialog", { name: "Preview IMG_001.jpg" });
    expect(within(viewer).getByText("Rina-Wisuda · Proof · 1 dari 6")).toBeInTheDocument();
    expect(within(viewer).getByRole("img", { name: "IMG_001.jpg" })).toHaveAttribute(
      "src",
      "/api/w/ws-1/gallery-photos/p-1/preview",
    );
    expect(within(viewer).getByRole("link", { name: "Buka di Google Drive" })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    const missing = await screen.findByRole("dialog", { name: "Preview IMG_002.jpg" });
    expect(within(missing).getByText("File tidak ditemukan di Google Drive")).toBeInTheDocument();
    expect(
      within(missing).getByText("Rina-Wisuda · Proof · Hilang · 2 dari 6"),
    ).toBeInTheDocument();
    expect(
      within(missing).queryByRole("link", { name: "Buka di Google Drive" }),
    ).not.toBeInTheDocument();
  });

  it("AC-GAL-031 shows Buka di Drive as an icon link on phones", async () => {
    stubViewport(true);
    render(<GalleryPhotosSection workspaceId="ws-1" page={PAGE} browseAction={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "IMG_001.jpg" }));
    const viewer = await screen.findByRole("dialog", { name: "Preview IMG_001.jpg" });
    const link = within(viewer).getByRole("link", { name: "Buka di Drive" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveTextContent("");
  });
});
