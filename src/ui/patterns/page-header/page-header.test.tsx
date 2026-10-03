import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders breadcrumb, one heading, utilities and action", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Dasbor"
        title="Dasbor"
        utilities={<button type="button">Cari</button>}
        action={<button type="button">Tambah</button>}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("AsterDasbor");
    expect(screen.getByRole("heading", { name: "Dasbor" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cari" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tambah" })).toBeInTheDocument();
  });

  it("renders route tabs below the hero while keeping the header track", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Layanan"
        title="Layanan"
        tabs={{
          label: "Bagian layanan",
          tabs: [{ href: "/services", label: "Layanan", isActive: true }],
        }}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Bagian layanan" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("border-b");
  });

  it("renders linked ancestors in a reusable breadcrumb trail", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Kategori"
        breadcrumbs={[
          { label: "Aster", href: "/w/A" },
          { label: "Layanan", href: "/w/A/services" },
          { label: "Kategori" },
        ]}
        title="Kategori"
      />,
    );

    expect(screen.getByRole("link", { name: "Aster" })).toHaveAttribute("href", "/w/A");
    expect(screen.getByRole("link", { name: "Layanan" })).toHaveAttribute("href", "/w/A/services");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent(
      "AsterLayananKategori",
    );
    expect(
      screen.getAllByText("Kategori").find((element) => element.getAttribute("aria-current")),
    ).toHaveAttribute("aria-current", "page");
  });

  it("AC-PRJ-015 puts the adornment after the title and the meta in place of the subtitle", () => {
    render(
      <PageHeader
        parent="Proyek"
        current="Wisuda Basic — Rina"
        title="Wisuda Basic — Rina"
        subtitle="Tidak dipakai"
        meta="Rina · Belum ada jadwal"
        titleAdornment={<span>Dibooking</span>}
      />,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Wisuda Basic — Rina" });
    expect(heading.nextElementSibling).toHaveTextContent("Dibooking");
    expect(screen.getByText("Rina · Belum ada jadwal")).toBeInTheDocument();
    expect(screen.queryByText("Tidak dipakai")).not.toBeInTheDocument();
  });
});
