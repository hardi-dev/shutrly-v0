import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader, PageHeaderTrail } from "./page-header";

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
    expect(screen.getByRole("navigation", { name: "Lokasi halaman" })).toHaveTextContent(
      "AsterDasbor",
    );
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
    expect(screen.getByRole("navigation", { name: "Lokasi halaman" })).toHaveTextContent(
      "AsterLayananKategori",
    );
    expect(
      screen.getAllByText("Kategori").find((element) => element.getAttribute("aria-current")),
    ).toHaveAttribute("aria-current", "page");
  });

  it("F-22 renders a trail made elsewhere in place of the generated one", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Galeri"
        title="Galeri"
        trail={
          <PageHeaderTrail
            label="Lokasi halaman"
            items={[
              { label: "Aster", href: "/w/A" },
              { label: "Proyek", href: "/w/A/projects" },
              { label: "Galeri" },
            ]}
          />
        }
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Lokasi halaman" });
    expect(nav).toHaveTextContent("AsterProyekGaleri");
    expect(screen.getByRole("link", { name: "Proyek" })).toHaveAttribute("href", "/w/A/projects");
    expect(screen.getAllByRole("navigation", { name: "Lokasi halaman" })).toHaveLength(1);
  });

  it("AC-CRUMB-010 a crumb without href is plain text and not focusable", () => {
    render(
      <PageHeader
        parent="Beranda"
        current="Tinjau"
        title="Foto cetak"
        breadcrumbs={[
          { label: "Beranda", href: "/g/T" },
          { label: "Foto cetak" },
          { label: "Tinjau" },
        ]}
      />,
    );

    expect(screen.queryByRole("link", { name: "Foto cetak" })).toBeNull();
    expect(screen.getByText("Foto cetak", { selector: "span" })).not.toHaveAttribute("tabindex");
    expect(screen.getByText("Tinjau")).toHaveAttribute("aria-current", "page");
  });

  it("AC-CRUMB-015 renders the leading control before the trail", () => {
    render(
      <PageHeader
        parent="Aster"
        current="Dasbor"
        title="Dasbor"
        leading={<button type="button">Toggle</button>}
      />,
    );

    const toggle = screen.getByRole("button", { name: "Toggle" });
    const nav = screen.getByRole("navigation", { name: "Lokasi halaman" });
    expect(toggle.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

  it("isFlush lines the breadcrumb and hero up with the column, leaving the border to the band", () => {
    const { container } = render(
      <PageHeader parent="Beranda" current="Semua foto" title="Semua foto" isFlush />,
    );
    const header = container.querySelector("header");
    expect(header?.className).not.toContain("border-b");
    const [breadcrumbRow, hero] = Array.from(header?.children ?? []);
    expect(breadcrumbRow.className).toContain("px-0");
    expect(breadcrumbRow.className).not.toContain(
      "pl-(--component-page-header-breadcrumb-padding-x)",
    );
    expect(hero.className).toContain("px-0");
    expect(hero.className).not.toContain("px-(--component-page-header-hero-padding-x)");
  });
});
