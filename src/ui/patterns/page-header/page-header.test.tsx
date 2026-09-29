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
});
