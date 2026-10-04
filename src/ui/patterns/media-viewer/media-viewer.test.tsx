import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaViewer } from "./media-viewer";

const ITEMS = [
  { id: "a", title: "A_011.jpg", meta: "Rina-Wisuda › Akad · Proof · 11 dari 13" },
  { id: "b", title: "A_012.jpg", meta: "Rina-Wisuda › Akad · Proof · 12 dari 13" },
  { id: "c", title: "IMG_002.jpg", meta: "Rina-Wisuda · Hilang · 13 dari 13", isMissing: true },
];

const renderActions = () => <a href="#drive">Buka di Google Drive</a>;

function Harness({ onClose }: Readonly<{ onClose: () => void }>) {
  const [index, setIndex] = useState<number | null>(1);
  const handleClose = () => {
    setIndex(null);
    onClose();
  };
  const imageSrc = (item: { id: string }, size: string) => `/media/${item.id}/${size}`;
  return (
    <MediaViewer
      items={ITEMS}
      index={index}
      onIndexChange={setIndex}
      onClose={handleClose}
      imageSrc={imageSrc}
      missingText="File tidak ditemukan di Google Drive"
      renderActions={renderActions}
    />
  );
}

describe("MediaViewer (C48)", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-031 labels the dialog, shows the meta and focuses Tutup", () => {
    render(<Harness onClose={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: "Preview A_012.jpg" })).toBeInTheDocument();
    expect(screen.getByText("Rina-Wisuda › Akad · Proof · 12 dari 13")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "A_012.jpg" })).toHaveAttribute("src", "/media/b/stage");
    expect(screen.getByRole("button", { name: "Tutup" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "A_012.jpg" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("AC-GAL-031 moves with the arrow keys, Home and End, and closes with Esc", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.keyboard("{ArrowLeft}");
    expect(screen.getByRole("dialog", { name: "Preview A_011.jpg" })).toBeInTheDocument();
    await userEvent.keyboard("{End}");
    expect(screen.getByText("File tidak ditemukan di Google Drive")).toBeInTheDocument();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("dialog", { name: "Preview A_011.jpg" })).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("dialog", { name: "Preview A_012.jpg" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("AC-GAL-031 picks a photo from the filmstrip and the → button", async () => {
    render(<Harness onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "A_011.jpg" }));
    expect(screen.getByRole("dialog", { name: "Preview A_011.jpg" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Foto berikutnya" }));
    expect(screen.getByRole("dialog", { name: "Preview A_012.jpg" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Buka di Google Drive" })).toBeInTheDocument();
  });

  it("AC-GAL-034 tries the fallback once, then reads the photo as missing", () => {
    const imageSrc = (item: { id: string }) => `/google/${item.id}`;
    const imageFallbackSrc = (item: { id: string }) => `/route/${item.id}`;
    render(
      <MediaViewer
        items={ITEMS.slice(0, 2)}
        index={1}
        onIndexChange={vi.fn()}
        onClose={vi.fn()}
        imageSrc={imageSrc}
        imageFallbackSrc={imageFallbackSrc}
        missingText="File tidak ditemukan di Google Drive"
      />,
    );
    const stage = () => screen.getAllByRole("img", { name: "A_012.jpg" })[0];
    expect(stage()).toHaveAttribute("src", "/google/b");
    fireEvent.error(stage());
    expect(stage()).toHaveAttribute("src", "/route/b");
    fireEvent.error(stage());
    expect(screen.getByText("File tidak ditemukan di Google Drive")).toBeInTheDocument();
  });
});
