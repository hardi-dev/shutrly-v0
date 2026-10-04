import { render, screen } from "@testing-library/react";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GalleryPageScreen } from "./gallery-page-screen";

vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PAGE = {
  project: { id: "p-1", title: "Wisuda Basic — Rina", status: "BOOKED" as const },
  gallery: {
    id: "g-1",
    status: "DRAFT" as const,
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 0,
    failedSourceCount: 0,
    counts: { proof: 0, edited: 0, print: 0, missing: 0 },
  },
  sources: [],
};

describe("GalleryPageScreen", () => {
  beforeEach(() => {
    stubViewport(false);
  });

  it("AC-GAL-027 AC-GAL-014 shows the password, an empty Sumber foto and no photos yet", () => {
    render(<GalleryPageScreen workspaceId="ws-1" page={PAGE} />);
    expect(screen.getByText("mawar-4821")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salin password" })).toBeInTheDocument();
    expect(screen.getByText("Belum ada folder")).toBeInTheDocument();
    expect(screen.getByText("Belum ada foto")).toBeInTheDocument();
  });

  it("design shows the status and meta in the phone header block", () => {
    stubViewport(true);
    render(<GalleryPageScreen workspaceId="ws-1" page={PAGE} />);
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("Belum ada folder · Tanpa kedaluwarsa")).toBeInTheDocument();
  });
});
