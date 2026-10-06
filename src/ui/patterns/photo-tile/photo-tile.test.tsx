import { fireEvent, render, screen } from "@testing-library/react";
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

  it("AC-GAL-034 swaps to the fallback once when the image fails, then shows no image", () => {
    const { container } = render(
      <PhotoTile fileName="IMG_001.jpg" imageSrc="/google.jpg" fallbackSrc="/route.jpg" />,
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/google.jpg");
    expect(container.querySelector("img")).toHaveAttribute("referrerpolicy", "no-referrer");
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")).toHaveAttribute("src", "/route.jpg");
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container.querySelector("img")).toBeNull();
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

describe("PhotoTile selectable (F-10 Photo Tile/Selectable, A-25, A-32)", () => {
  it("AC-SEL-002 toggles the pick from the whole tile and exposes the state", async () => {
    const onChange = vi.fn();
    render(
      <PhotoTile
        fileName="IMG_001.jpg"
        imageSrc="/x.jpg"
        selection={{ isSelected: false, onChange }}
      />,
    );
    const tile = screen.getByRole("button", { name: "IMG_001.jpg" });
    expect(tile).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(tile);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("AC-SEL-003 disables unpicked tiles when the group is full, but keeps picked ones", () => {
    render(
      <>
        <PhotoTile
          fileName="IMG_001.jpg"
          imageSrc="/x.jpg"
          selection={{ isSelected: false, isDisabled: true, onChange: vi.fn() }}
        />
        <PhotoTile
          fileName="IMG_002.jpg"
          imageSrc="/x.jpg"
          selection={{ isSelected: true, isDisabled: true, onChange: vi.fn() }}
        />
      </>,
    );
    expect(screen.getByRole("button", { name: "IMG_001.jpg" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "IMG_002.jpg" })).toBeEnabled();
  });

  it("AC-SEL-021 shows the quantity chip and opens the note from its own button", async () => {
    const onNote = vi.fn();
    const onChange = vi.fn();
    render(
      <PhotoTile
        fileName="IMG_002.jpg"
        imageSrc="/x.jpg"
        selection={{ isSelected: true, onChange }}
        badge={{ label: "× 1", tone: "info" }}
        note={{
          hasNote: true,
          label: "Catatan",
          accessibleLabel: "Catatan untuk IMG_002.jpg",
          onPress: onNote,
        }}
      />,
    );
    expect(screen.getByText("× 1")).toBeVisible();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Catatan untuk IMG_002.jpg" }));
    expect(onNote).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();
  });
});
