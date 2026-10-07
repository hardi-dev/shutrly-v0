// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AccessCardView } from "@/features/gallery/application/use-cases/get-access-card/get-access-card.types";

import { ProjectAccessCard } from "./project-access-card";
import type { ProjectAccessActions } from "./project-access-card.types";

vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => false,
}));
const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/ui/patterns/toast/toast", () => ({ showToast }));

function stubClipboard(writeText: () => Promise<void>) {
  const fn = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", { value: { writeText: fn }, configurable: true });
  return fn;
}

const CARD: AccessCardView = {
  state: "ACTIVE",
  projectId: "p1",
  link: "https://shutrly.app/g/abcdefghijklmnopqrstuvwxyz0123456789ABC3kQ9",
  maskedLink: "shutrly.app/g/••••••••3kQ9",
  gallery: {
    id: "g1",
    status: "PUBLISHED",
    password: "mawar-4821",
    expiresAt: null,
    expiryDays: null,
    activeSourceCount: 1,
    failedSourceCount: 0,
    failedSourceNames: [],
    counts: { proof: 10, edited: 0, print: 0, missing: 0 },
  },
};

function renderCard(card: AccessCardView) {
  const actions: ProjectAccessActions = {
    rotateLinkAction: vi.fn(() => Promise.resolve({ ok: true as const, token: "new" })),
    proposeAction: vi.fn(),
    rotatePasswordAction: vi.fn(),
  };
  render(<ProjectAccessCard workspaceId="w1" card={card} actions={actions} />);
  return actions;
}

describe("ProjectAccessCard (aksesklien-kartu A–C)", () => {
  it("A: shows the masked link, the password and the expiry", () => {
    renderCard(CARD);
    expect(screen.getByText("shutrly.app/g/••••••••3kQ9")).toBeTruthy();
    expect(screen.getByText("mawar-4821")).toBeTruthy();
    expect(screen.getByText("Kedaluwarsa")).toBeTruthy();
  });

  it("AC-ACC-009 Ganti link warns first, then rotates", async () => {
    const user = userEvent.setup();
    const actions = renderCard(CARD);
    await user.click(screen.getByRole("button", { name: "Ganti link" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/termasuk link invoice/)).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Ganti link" }));
    expect(actions.rotateLinkAction).toHaveBeenCalledWith("w1", "p1");
  });

  it("Salin link copies the whole link, not the masked one", async () => {
    const writeText = stubClipboard(() => Promise.resolve());
    renderCard(CARD);
    fireEvent.click(screen.getByRole("button", { name: "Salin link" }));
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({ tone: "success", title: "Disalin" });
    });
    expect(writeText).toHaveBeenCalledWith(CARD.link);
  });

  it("a refused clipboard shows the whole link selected, ready to copy by hand", async () => {
    stubClipboard(() => Promise.reject(new DOMException("denied", "NotAllowedError")));
    renderCard(CARD);
    fireEvent.click(screen.getByRole("button", { name: "Salin link" }));
    await waitFor(() => {
      expect(window.getSelection()?.toString()).toBe(CARD.link);
    });
    expect(screen.getByText(CARD.link)).toBeTruthy();
    expect(screen.queryByText("shutrly.app/g/••••••••3kQ9")).toBeNull();
    expect(showToast).toHaveBeenCalledWith({
      tone: "warning",
      title: "Belum tersalin",
      body: "Teksnya sudah ditandai. Salin dengan Ctrl+C atau ⌘C, atau tekan lama lalu Salin.",
    });
  });

  it("B: a draft gallery explains the link can't be opened yet", () => {
    renderCard({ ...CARD, state: "DRAFT" });
    expect(screen.getByText(/sampai galeri dipublikasikan/)).toBeTruthy();
  });

  it("C: an archived gallery shows no link and no buttons", () => {
    renderCard({ ...CARD, state: "INACTIVE" });
    expect(screen.getByText("Tidak aktif")).toBeTruthy();
    expect(screen.queryByText("mawar-4821")).toBeNull();
    expect(screen.queryByRole("button", { name: "Ganti link" })).toBeNull();
  });
});
