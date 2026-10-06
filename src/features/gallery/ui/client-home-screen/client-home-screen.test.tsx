// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ClientHomeView } from "@/features/gallery/application/use-cases/get-client-home/get-client-home.types";

import { ClientHomeScreen } from "./client-home-screen";

const GATE = { studioName: "Studio Senja", projectTitle: "Wisuda Rina", clientFirstName: "Rina" };
const BASE: ClientHomeView = {
  landing: "HOME",
  greeting: { kind: "START" },
  finalDeliveryPublished: false,
  proofCount: 24,
  editedCount: 0,
  printCount: 0,
  groups: [
    {
      id: "g-edit",
      name: "Foto edit",
      status: "OPEN",
      limit: 8,
      usage: 3,
      unit: "foto",
      action: "CONTINUE",
      isPrimary: true,
      progress: 0.375,
    },
    {
      id: "g-print",
      name: "Foto cetak",
      status: "SUBMITTED",
      limit: 4,
      usage: 4,
      unit: "lembar",
      action: "VIEW",
      isPrimary: false,
      progress: 1,
    },
  ],
};

function renderHome(home: ClientHomeView) {
  render(<ClientHomeScreen gate={GATE} home={home} token="T1" />);
}

describe("ClientHomeScreen (A-24)", () => {
  it("AC-SEL-001 greets the client and shows Semua foto, Hasil akhir pending and each group", () => {
    renderHome(BASE);
    expect(screen.getAllByRole("heading", { name: "Halo, Rina" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Semua foto/ })).toHaveAttribute("href", "/g/T1/foto");
    expect(
      screen.getByText("Belum tersedia · muncul di sini setelah foto selesai diedit."),
    ).toBeVisible();
    expect(screen.getByText("3 dari 8 foto dipilih")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lanjut memilih" })).toHaveAttribute(
      "href",
      "/g/T1/pilih/g-edit",
    );
    expect(screen.getByText("4 lembar dikirim · menunggu fotografer")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lihat pilihan" })).toHaveAttribute(
      "href",
      "/g/T1/pilih/g-print/tinjau",
    );
  });

  it("AC-SEL-020 puts Hasil akhir siap at the top once delivered", () => {
    renderHome({
      ...BASE,
      finalDeliveryPublished: true,
      greeting: { kind: "DELIVERED" },
      editedCount: 12,
      printCount: 4,
    });
    const ready = screen.getByRole("region", { name: "Hasil akhir siap" });
    expect(within(ready).getByText(/12 foto edit dan 4 foto cetak/)).toBeVisible();
    expect(within(ready).getByRole("link", { name: /Lihat & unduh/ })).toHaveAttribute(
      "href",
      "/g/T1/hasil-akhir",
    );
    expect(screen.queryByText(/Belum tersedia/)).toBeNull();
  });
});
