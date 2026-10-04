import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoTile, PhotoTileSkeleton } from "./photo-tile";

describe("PhotoTile (C46)", () => {
  it("AC-GAL-014 is one button named by the file, with a decorative lazy image", async () => {
    const onPress = vi.fn();
    const { container } = render(
      <PhotoTile
        fileName="IMG_001.jpg"
        imageSrc="/api/w/ws/gallery-photos/p/thumb"
        onPress={onPress}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "IMG_001.jpg" }));
    expect(onPress).toHaveBeenCalled();
    const image = container.querySelector("img");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("AC-GAL-014 marks a missing file with Hilang in text", () => {
    render(<PhotoTile fileName="IMG_002.jpg" imageSrc="/x" isMissing onPress={vi.fn()} />);
    expect(screen.getByRole("button", { name: "IMG_002.jpg, hilang" })).toBeInTheDocument();
    expect(screen.getByText("Hilang")).toBeInTheDocument();
  });

  it("AC-GAL-029 shows the meta line in search results", () => {
    render(<PhotoTile fileName="IMG_021.jpg" meta="Rina-Wisuda · edited" imageSrc="/x" />);
    expect(screen.getByText("Rina-Wisuda · edited")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("C-007 renders a hidden skeleton", () => {
    const { container } = render(<PhotoTileSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("fills its grid cell like a folder tile", () => {
    render(<PhotoTile fileName="IMG_001.jpg" imageSrc="/x" onPress={vi.fn()} />);
    expect(screen.getByRole("button", { name: "IMG_001.jpg" })).toHaveClass("w-full");
  });
});
