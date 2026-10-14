import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "./data-table";

const columns = [{ id: "name", label: "KLIEN" }] as const;
const rows = [{ id: "a", name: "Anisa Putri" }];

function renderName(row: { readonly name: string }) {
  return row.name;
}

describe("DataTable footer (AC-DASH-026)", () => {
  it("renders the footer below the grid when one is given", () => {
    render(
      <DataTable
        label="Proyek aktif"
        columns={columns}
        rows={rows}
        renderCell={renderName}
        footer="Menampilkan 1 dari 1 proyek aktif"
      />,
    );
    expect(screen.getByText("Menampilkan 1 dari 1 proyek aktif")).toHaveClass("border-t");
  });

  it("renders no footer when none is given", () => {
    const { container } = render(
      <DataTable label="Proyek aktif" columns={columns} rows={rows} renderCell={renderName} />,
    );
    expect(container.querySelector(".border-t")).toBeNull();
  });
});
