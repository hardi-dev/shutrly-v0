import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppPanel, PageContent } from "./app-panel";

describe("AppPanel (C28)", () => {
  it("renders the page title as the main landmark heading with actions before content", () => {
    render(
      <AppPanel title="Proyek" actions={<button type="button">Tambah</button>}>
        <PageContent>
          <p>Isi halaman</p>
        </PageContent>
      </AppPanel>,
    );

    const main = screen.getByRole("main", { name: "Proyek" });
    expect(screen.getByRole("heading", { level: 1, name: "Proyek" })).toBeInTheDocument();
    expect(main).toContainElement(screen.getByRole("button", { name: "Tambah" }));
    expect(main).toContainElement(screen.getByText("Isi halaman"));
  });

  it("centres Page Content inside the approved 1096px container", () => {
    render(
      <AppPanel title="Dasbor">
        <PageContent>
          <p>Konten</p>
        </PageContent>
      </AppPanel>,
    );

    expect(screen.getByText("Konten").parentElement).toHaveClass("max-w-[1096px]", "mx-auto");
  });
});
