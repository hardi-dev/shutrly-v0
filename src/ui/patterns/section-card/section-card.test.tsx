import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionCard } from "./section-card";

describe("SectionCard", () => {
  it("names the section region with its h2 title and shows the description", () => {
    render(
      <SectionCard title="Kontak" description="Ditampilkan di invoice.">
        <p>isi</p>
      </SectionCard>,
    );
    const region = screen.getByRole("region", { name: "Kontak" });
    expect(screen.getByRole("heading", { level: 2, name: "Kontak" })).toBeInTheDocument();
    expect(region).toHaveTextContent("Ditampilkan di invoice.");
    expect(region).toHaveTextContent("isi");
  });

  it("renders the header actions slot beside the heading", () => {
    render(
      <SectionCard title="Semua proyek" actions={<button type="button">Semua</button>}>
        <p>isi</p>
      </SectionCard>,
    );
    expect(screen.getByRole("button", { name: "Semua" })).toBeInTheDocument();
  });

  it("omits the header when there is no title and uses the aria-label as its name", () => {
    render(
      <SectionCard aria-label="Proyek aktif">
        <p>isi</p>
      </SectionCard>,
    );
    expect(screen.getByRole("region", { name: "Proyek aktif" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("uses padded, flush or bleed content insets from the section-card tokens", () => {
    const { rerender } = render(
      <SectionCard title="A">
        <p>isi</p>
      </SectionCard>,
    );
    const content = () => screen.getByTestId("section-card-content");
    expect(content().className).toContain("--component-section-card-content-padding");
    rerender(
      <SectionCard title="A" content="flush">
        <p>isi</p>
      </SectionCard>,
    );
    expect(content().className).toContain("--component-section-card-flush-padding-x");
    rerender(
      <SectionCard title="A" content="bleed">
        <p>isi</p>
      </SectionCard>,
    );
    expect(content().className).not.toContain("padding");
  });
});
