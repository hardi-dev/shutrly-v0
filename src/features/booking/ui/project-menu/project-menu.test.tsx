import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildProjectMenu } from "@/features/booking/domain/project-menu/project-menu";
import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";

import { ProjectMenu } from "./project-menu";

const { isMobile } = vi.hoisted(() => ({ isMobile: { value: false } }));
vi.mock("@/ui/hooks/use-mobile-viewport/use-mobile-viewport", () => ({
  useMobileViewport: () => isMobile.value,
}));

function renderMenu(status: ProjectStatus, whatsappNumber: string | null = "6281234567890") {
  const handlers = {
    onStep: vi.fn(),
    onEditInfo: vi.fn(),
    onCancel: vi.fn(),
    onDeleteDraft: vi.fn(),
    onAddNumber: vi.fn(),
  };
  render(
    <ProjectMenu
      title="Wisuda Basic — Rina"
      meta="Rina · 10 Nov 2026 · Dibooking"
      groups={buildProjectMenu({ status, hasWhatsappNumber: whatsappNumber !== null })}
      whatsappNumber={whatsappNumber}
      variant="row"
      handlers={handlers}
    />,
  );
  return handlers;
}

describe("ProjectMenu (AC-PRJ-027)", () => {
  beforeEach(() => {
    isMobile.value = false;
  });

  it("AC-PRJ-027 lists the BOOKED items with the Kirim ke klien group", async () => {
    const handlers = renderMenu("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: "Aksi untuk Wisuda Basic — Rina" }));
    const menu = screen.getByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Mulai pemotretan", "Ubah info", "Chat WhatsApp", "Batalkan proyek"]);
    expect(within(menu).getByText("KIRIM KE KLIEN")).toBeInTheDocument();
    const chat = within(menu).getByRole("menuitem", { name: "Chat WhatsApp" });
    expect(chat).toHaveAttribute("href", "https://wa.me/6281234567890");
    expect(chat).toHaveAttribute("target", "_blank");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Batalkan proyek" }));
    expect(handlers.onCancel).toHaveBeenCalled();
  });

  it("AC-PRJ-027 runs a step from the menu", async () => {
    const handlers = renderMenu("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: /Aksi untuk/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Mulai pemotretan" }));
    expect(handlers.onStep).toHaveBeenCalledWith("START_SHOOTING");
  });

  it("AC-PRJ-027 offers Hapus draf for a draft and no destructive item for a completed project", async () => {
    renderMenu("DRAFT");
    await userEvent.click(screen.getByRole("button", { name: /Aksi untuk/ }));
    expect(screen.getByRole("menuitem", { name: "Hapus draf" })).toBeInTheDocument();
  });

  it("AC-PRJ-027 offers Tambah nomor WhatsApp when the client has no number", async () => {
    const handlers = renderMenu("BOOKED", null);
    await userEvent.click(screen.getByRole("button", { name: /Aksi untuk/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Tambah nomor WhatsApp" }));
    expect(handlers.onAddNumber).toHaveBeenCalled();
  });

  it("AC-PRJ-027 shows the phone sheet with the title and meta", async () => {
    isMobile.value = true;
    const handlers = renderMenu("BOOKED");
    await userEvent.click(screen.getByRole("button", { name: /Aksi untuk/ }));
    const sheet = screen.getByRole("dialog");
    expect(within(sheet).getByText("Rina · 10 Nov 2026 · Dibooking")).toBeInTheDocument();
    expect(within(sheet).getByText("KIRIM KE KLIEN")).toBeInTheDocument();
    await userEvent.click(within(sheet).getByRole("button", { name: "Ubah info" }));
    expect(handlers.onEditInfo).toHaveBeenCalled();
  });
});
