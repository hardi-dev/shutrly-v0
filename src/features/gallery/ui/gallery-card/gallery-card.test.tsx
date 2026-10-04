import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { stubViewport } from "@tests/support/gallery/viewport";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GalleryCardView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import { GalleryCard } from "./gallery-card";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast: vi.fn() }));

const PROJECT = { id: "p-1", title: "Wisuda Rina", status: "BOOKED" as const };
const GALLERY = {
  id: "g-1",
  status: "DRAFT" as const,
  password: "mawar-4821",
  expiresAt: null,
  expiryDays: null,
  activeSourceCount: 2,
  failedSourceCount: 0,
  counts: { proof: 8, edited: 2, print: 1, missing: 0 },
};

function renderCard(
  card: GalleryCardView,
  overrides: Partial<Parameters<typeof GalleryCard>[0]> = {},
) {
  const props = {
    workspaceId: "ws-1",
    card,
    createAction: vi.fn(() => Promise.resolve({ ok: true as const, galleryId: "g-1" })),
    proposeAction: vi.fn(() => Promise.resolve("mawar-4821")),
    ...overrides,
  };
  render(<GalleryCard {...props} />);
  return props;
}

describe("GalleryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubViewport(false);
  });

  it("AC-GAL-001 offers Buat galeri and opens the dialog with a proposal", async () => {
    const props = renderCard({ project: PROJECT, canCreate: true, gallery: null });
    expect(screen.getByText("Belum ada galeri")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    expect(props.proposeAction).toHaveBeenCalledWith("ws-1", "p-1");
    expect(await screen.findByRole("dialog", { name: "Buat galeri" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password galeri")).toHaveValue("mawar-4821");
  });

  it("AC-GAL-003 shows the booking hint and no Buat galeri on a draft project", () => {
    renderCard({ project: { ...PROJECT, status: "DRAFT" }, canCreate: false, gallery: null });
    expect(screen.getByText("Galeri tersedia setelah booking")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Buat galeri" })).not.toBeInTheDocument();
  });

  it("AC-GAL-001 AC-GAL-027 shows the draft gallery facts and copies the password", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderCard({ project: PROJECT, canCreate: false, gallery: GALLERY });
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.getByText("2 folder")).toBeInTheDocument();
    expect(screen.getByText("8 proof · 2 edited · 1 print")).toBeInTheDocument();
    expect(screen.getByText("Tidak ada")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Salin password" }));
    expect(writeText).toHaveBeenCalledWith("mawar-4821");
    await userEvent.click(screen.getByRole("button", { name: "Kelola galeri" }));
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });

  it("AC-GAL-001 creates the gallery and opens its page", async () => {
    const props = renderCard({ project: PROJECT, canCreate: true, gallery: null });
    await userEvent.click(screen.getByRole("button", { name: "Buat galeri" }));
    const dialog = await screen.findByRole("dialog", { name: "Buat galeri" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Buat galeri" }));
    await waitFor(() => {
      expect(props.createAction).toHaveBeenCalledWith("ws-1", "p-1", {
        password: "mawar-4821",
        expiry: { type: "NONE" },
      });
    });
    expect(push).toHaveBeenCalledWith("/w/ws-1/projects/p-1/gallery");
  });
});
